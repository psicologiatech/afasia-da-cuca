"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Prancha.module.css";
import { DadosPrancha, ItemPrancha, TelaPrancha } from "./tipos";
import { CONTEUDO_INICIAL, INTENSIDADE_DOR, PARTES_DOR, comGenero } from "./conteudoInicial";
import { TecladoGrande } from "../TecladoGrande/TecladoGrande";
import { carregarDados, falar, iniciarChamado, novoId, pararChamado, prepararFoto, salvarDados } from "./apoio";
import { EstadoSync, baixar, criarNaNuvem, enviar, guardarPin, guardarToken, lerPin, lerSync, linkDaPrancha, mesclarFotos, obterToken, salvarSync } from "./sincronizacao";

type StatusNuvem = "local" | "salvo" | "enviando" | "pendente" | "erro";

// Prancha por fotos: tudo numa tela só, uma camada de profundidade,
// "Não é isso" sempre visível e um modo família para tirar fotos na hora.

type Destaque = { texto: string; emoji?: string; foto?: string } | null;
type Edicao = { telaId: string; item: ItemPrancha; novo: boolean } | null;

const TEMPO_SEGURAR = 1500; // ms segurando a engrenagem para abrir o modo família
const BLOQUEIO_TOQUE = 700; // ms ignorando toques repetidos (tremor, toque duplo)

export const Prancha: React.FC = () => {
  const [dados, setDados] = useState<DadosPrancha>(CONTEUDO_INICIAL);
  const [pronto, setPronto] = useState(false);
  const [telaId, setTelaId] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [destaque, setDestaque] = useState<Destaque>(null);
  const [parteDor, setParteDor] = useState<string | null>(null);
  const [pessoa, setPessoa] = useState<ItemPrancha | null>(null);
  const [chamando, setChamando] = useState(false);
  const [familia, setFamilia] = useState(false);
  const [config, setConfigAberta] = useState(false);
  const [edicao, setEdicao] = useState<Edicao>(null);
  const [segurando, setSegurando] = useState(false);
  const [noite, setNoite] = useState(false);
  const [aviso, setAviso] = useState("");
  const [teclado, setTeclado] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nuvem, setNuvem] = useState<StatusNuvem>("local");
  const [pedirPin, setPedirPin] = useState(false);
  const [nuvemAberta, setNuvemAberta] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const dadosRef = useRef(dados);
  const syncRef = useRef<EstadoSync>({ pendente: false, apagar: [] });
  const enviandoRef = useRef(false);

  const ultimoToque = useRef(0);
  const timerSegurar = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerDestaque = useRef<ReturnType<typeof setTimeout> | null>(null);

  const g = dados.config.genero;
  const t = useCallback((s: string) => comGenero(s, g), [g]);

  const guardarLocal = useCallback((novo: DadosPrancha) => {
    dadosRef.current = novo;
    setDados(novo);
    salvarDados(novo).then((ok) => { if (!ok) setAviso("Não foi possível guardar neste aparelho."); });
  }, []);

  // envia ao servidor o que está pendente (precisa do PIN, que só existe no modo família)
  const sincronizar = useCallback(async () => {
    const tk = tokenRef.current, pin = lerPin();
    if (!tk || !syncRef.current.pendente || enviandoRef.current) return;
    if (!pin) { setNuvem("pendente"); return; }
    if (!navigator.onLine) { setNuvem("pendente"); return; }
    enviandoRef.current = true; setNuvem("enviando");
    try {
      const enviado = dadosRef.current;
      const r = await enviar(tk, pin, enviado, syncRef.current);
      // se nada mudou durante o envio, guarda os caminhos das fotos enviadas
      const mudouNoMeio = dadosRef.current !== enviado;
      if (!mudouNoMeio) guardarLocal(r.dados);
      syncRef.current = { ...r.sync, pendente: mudouNoMeio };
      salvarSync(syncRef.current);
      setNuvem(syncRef.current.pendente ? "pendente" : "salvo");
    } catch (e) {
      setNuvem("erro");
      setAviso(e instanceof Error ? e.message : "Não foi possível salvar na nuvem.");
    } finally {
      enviandoRef.current = false;
    }
  }, [guardarLocal]);

  const atualizar = useCallback((novo: DadosPrancha, apagarFotos: string[] = []) => {
    guardarLocal(novo);
    if (!token) return;
    syncRef.current = { ...syncRef.current, pendente: true, apagar: [...syncRef.current.apagar, ...apagarFotos] };
    salvarSync(syncRef.current);
    void sincronizar();
  }, [token, guardarLocal, sincronizar]);

  // traz do servidor, se lá estiver mais novo
  const puxar = useCallback(async (tk: string) => {
    try {
      const srv = await baixar(tk);
      const s = syncRef.current;
      if (s.pendente) { void sincronizar(); return; }
      if (s.versaoServidor === undefined && srv.versao === 1) {
        // primeira ligação deste aparelho a uma prancha nova: o conteúdo daqui sobe
        syncRef.current = { ...s, pendente: true }; salvarSync(syncRef.current); setNuvem("pendente");
        return;
      }
      if (srv.versao !== s.versaoServidor) {
        const mesclado = await mesclarFotos(srv.dados, dadosRef.current, tk);
        guardarLocal(mesclado);
        syncRef.current = { ...s, versaoServidor: srv.versao }; salvarSync(syncRef.current);
      }
      setNuvem("salvo");
    } catch {
      setNuvem(syncRef.current.pendente ? "pendente" : "erro");
    }
  }, [guardarLocal, sincronizar]);

  // carregar do aparelho e, se houver link da família, da nuvem
  useEffect(() => {
    const tk = obterToken();
    tokenRef.current = tk;
    setToken(tk);
    syncRef.current = lerSync();
    carregarDados().then((d) => {
      dadosRef.current = d; setDados(d); setPronto(true);
      if (tk) void puxar(tk);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // de tempos em tempos, e quando a internet volta, sincroniza
  useEffect(() => {
    if (!token) return;
    const tk = token;
    const ciclo = () => {
      if (document.visibilityState !== "visible") return;
      if (syncRef.current.pendente) void sincronizar();
      else if (!familia) void puxar(tk);
    };
    const id = setInterval(ciclo, 90_000);
    window.addEventListener("online", ciclo);
    return () => { clearInterval(id); window.removeEventListener("online", ciclo); };
  }, [token, familia, puxar, sincronizar]);

  // tema noturno automático (20h às 7h)
  useEffect(() => {
    const calcular = () => {
      const h = new Date().getHours();
      const tema = dados.config.tema;
      setNoite(tema === "noturno" || (tema === "auto" && (h >= 20 || h < 7)));
    };
    calcular();
    const id = setInterval(calcular, 60_000);
    return () => clearInterval(id);
  }, [dados.config.tema]);

  // manter a tela acesa enquanto a prancha está aberta
  useEffect(() => {
    let trava: { release: () => Promise<void> } | null = null;
    const pedir = async () => {
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
        if (nav.wakeLock && document.visibilityState === "visible") trava = await nav.wakeLock.request("screen");
      } catch { /* sem suporte */ }
    };
    void pedir();
    const aoVoltar = () => { if (document.visibilityState === "visible") void pedir(); };
    document.addEventListener("visibilitychange", aoVoltar);
    return () => { document.removeEventListener("visibilitychange", aoVoltar); void trava?.release(); };
  }, []);

  const podeTocar = () => {
    const agora = Date.now();
    if (agora - ultimoToque.current < BLOQUEIO_TOQUE) return false;
    ultimoToque.current = agora;
    return true;
  };

  const dizer = useCallback((texto: string, emoji?: string, foto?: string, manterPessoa = false) => {
    falar(texto, dados.config.velocidadeVoz);
    if (!manterPessoa) setPessoa(null);
    setDestaque({ texto, emoji, foto });
    if (timerDestaque.current) clearTimeout(timerDestaque.current);
    timerDestaque.current = setTimeout(() => setDestaque(null), 4000);
  }, [dados.config.velocidadeVoz]);

  const telasVisiveis = useMemo(
    () => dados.telas.filter((tl) => !dados.config.modoSimples || tl.simples),
    [dados.telas, dados.config.modoSimples]
  );
  const tela = dados.telas.find((tl) => tl.id === telaId) || null;

  const irPara = (id: string | null) => {
    setTelaId(id); setPagina(0); setParteDor(null); setPessoa(null);
  };

  const abrirTela = (tl: TelaPrancha) => {
    if (!familia && !podeTocar()) return;
    if (tl.tipo === "chamar") {
      falar(tl.fala, dados.config.velocidadeVoz);
      setChamando(true);
      iniciarChamado();
      return;
    }
    if (!familia) falar(t(tl.fala), dados.config.velocidadeVoz);
    irPara(tl.id);
  };

  const tocarItem = (tl: TelaPrancha, it: ItemPrancha) => {
    if (familia) { setEdicao({ telaId: tl.id, item: { ...it }, novo: false }); return; }
    if (!podeTocar()) return;
    if (tl.tipo === "pessoas") { dizer(t(it.fala) || it.rotulo, it.emoji, it.foto, true); setPessoa(it); return; }
    dizer(t(it.fala), it.emoji, it.foto);
  };

  const pararDeChamar = () => { pararChamado(); setChamando(false); };

  // ----- barra fixa -----
  const naoEIsso = () => { if (podeTocar()) dizer("Não é isso.", "✋"); };
  const sim = () => { if (podeTocar()) dizer("Sim.", "👍"); };
  const nao = () => { if (podeTocar()) dizer("Não.", "👎"); };

  // ----- modo família: segurar a engrenagem -----
  const comecarSegurar = () => {
    if (familia) { setFamilia(false); setConfigAberta(false); return; }
    setSegurando(true);
    timerSegurar.current = setTimeout(() => {
      setSegurando(false);
      if (token && !lerPin()) setPedirPin(true); else { setFamilia(true); void sincronizar(); }
    }, TEMPO_SEGURAR);
  };
  const soltarSegurar = () => {
    if (timerSegurar.current) clearTimeout(timerSegurar.current);
    setSegurando(false);
  };

  // ----- paginação: até 8 por tela (4 no modo simples) -----
  const porPagina = dados.config.modoSimples ? 4 : 8;
  function paginar<T>(lista: T[]): { itens: T[]; temMais: boolean; total: number } {
    const extra = familia ? 1 : 0; // espaço do "Adicionar"
    if (lista.length + extra <= porPagina) return { itens: lista, temMais: false, total: 1 };
    const cabe = porPagina - 1 - extra;
    const total = Math.ceil(lista.length / cabe);
    const p = Math.min(pagina, total - 1);
    return { itens: lista.slice(p * cabe, p * cabe + cabe), temMais: true, total };
  }

  // ----- edição -----
  const salvarEdicao = (item: ItemPrancha) => {
    if (!edicao) return;
    const telas = dados.telas.map((tl) => {
      if (tl.id !== edicao.telaId) return tl;
      const existe = tl.itens.some((i) => i.id === item.id);
      return { ...tl, itens: existe ? tl.itens.map((i) => (i.id === item.id ? item : i)) : [...tl.itens, item] };
    });
    const antigo = dados.telas.find((tl) => tl.id === edicao.telaId)?.itens.find((i) => i.id === item.id);
    const apagar = antigo?.fotoBlob && antigo.fotoBlob !== item.fotoBlob ? [antigo.fotoBlob] : [];
    atualizar({ ...dados, telas }, apagar);
    setEdicao(null);
  };
  const excluirItem = (telaIdEd: string, id: string) => {
    const antigo = dados.telas.find((tl) => tl.id === telaIdEd)?.itens.find((i) => i.id === id);
    atualizar({ ...dados, telas: dados.telas.map((tl) => (tl.id === telaIdEd ? { ...tl, itens: tl.itens.filter((i) => i.id !== id) } : tl)) }, antigo?.fotoBlob ? [antigo.fotoBlob] : []);
    setEdicao(null);
  };
  const novoItem = (tl: TelaPrancha) => {
    setEdicao({ telaId: tl.id, novo: true, item: { id: novoId(), rotulo: "", fala: "", personalizado: true, emoji: tl.tipo === "pessoas" ? "🙂" : "⭐" } });
  };

  // ---------- telas ----------

  const Botao = ({ rotulo, emoji, foto, cor, onClick, oculto, editavel, classe }: {
    rotulo: string; emoji?: string; foto?: string; cor?: string; onClick: () => void; oculto?: boolean; editavel?: boolean; classe?: string;
  }) => (
    <button type="button" className={`${styles.botao} ${oculto ? styles.oculto : ""} ${classe || ""}`} style={cor ? { borderColor: cor } : undefined} onClick={onClick}>
      <span className={styles.imagem} style={cor && !foto ? { background: cor + "22" } : undefined}>
        {foto ? (
          <>
            {/* fundo desfocado da própria foto preenche o espaço; a foto aparece inteira por cima */}
            <img src={foto} alt="" className={styles.fundoFoto} aria-hidden />
            <img src={foto} alt="" className={styles.fotoInteira} />
          </>
        ) : <span className={styles.emoji} aria-hidden>{emoji}</span>}
      </span>
      <span className={styles.rotulo}>{rotulo}</span>
      {editavel && <span className={styles.lapis} aria-hidden>✎</span>}
      {oculto && <span className={styles.seloOculto}>escondido</span>}
    </button>
  );

  const Mais = ({ total }: { total: number }) => (
    <button type="button" className={`${styles.botao} ${styles.mais}`} onClick={() => setPagina((p) => (p + 1) % total)}>
      <span className={styles.emoji} aria-hidden>➜</span>
      <span className={styles.rotulo}>Mais</span>
    </button>
  );

  let conteudo: React.ReactNode;

  if (!tela) {
    conteudo = (
      <div className={`${styles.grade} ${dados.config.modoSimples ? styles.grade4 : ""}`}>
        {telasVisiveis.map((tl) => (
          <Botao key={tl.id} rotulo={tl.rotulo} emoji={tl.emoji} cor={tl.cor} onClick={() => abrirTela(tl)} classe={tl.tipo === "chamar" ? styles.chamar : ""} />
        ))}
      </div>
    );
  } else if (tela.tipo === "dor") {
    conteudo = parteDor ? (
      <div className={`${styles.grade} ${styles.grade3}`}>
        {INTENSIDADE_DOR.map((n) => (
          <Botao key={n.id} rotulo={n.rotulo} emoji={n.emoji} cor={n.cor} onClick={() => { if (podeTocar()) dizer(`${parteDor}. ${n.fala}`, n.emoji); }} />
        ))}
      </div>
    ) : (
      <div className={styles.grade}>
        {PARTES_DOR.map((p) => (
          <Botao key={p.id} rotulo={p.rotulo} emoji={p.emoji} cor={tela.cor} onClick={() => {
            if (!podeTocar()) return;
            const frase = p.id === "outro" ? "Dói em outro lugar" : `Dói ${p.id === "costas" ? "as costas" : (["cabeca", "garganta", "barriga", "perna"].includes(p.id) ? "a " : "o ") + p.rotulo.toLowerCase()}`;
            setParteDor(frase);
            falar(frase + ".", dados.config.velocidadeVoz);
          }} />
        ))}
      </div>
    );
  } else {
    const lista = tela.itens.filter((i) => familia || !i.oculto);
    const pg = paginar(lista);
    conteudo = (
      <>
        {lista.length === 0 && !familia && (
          <p className={styles.vazio}>
            {tela.tipo === "pessoas"
              ? "Ainda não há fotos de pessoas. Alguém da família pode adicionar: segure a engrenagem ⚙ no canto."
              : "Nada aqui ainda. Segure a engrenagem ⚙ para adicionar."}
          </p>
        )}
        <div className={`${styles.grade} ${dados.config.modoSimples ? styles.grade4 : ""}`}>
          {pg.itens.map((it) => (
            <Botao key={it.id} rotulo={t(it.rotulo)} emoji={it.emoji} foto={it.foto} cor={tela.cor} oculto={it.oculto} editavel={familia} onClick={() => tocarItem(tela, it)} />
          ))}
          {familia && (
            <button type="button" className={`${styles.botao} ${styles.adicionar}`} onClick={() => novoItem(tela)}>
              <span className={styles.emoji} aria-hidden>📷</span>
              <span className={styles.rotulo}>Adicionar</span>
            </button>
          )}
          {pg.temMais && <Mais total={pg.total} />}
        </div>
      </>
    );
  }

  return (
    <div className={`${styles.app} ${noite ? styles.noite : ""} ${familia ? styles.modoFamilia : ""}`}>
      {/* barra fixa */}
      <div className={styles.barra}>
        {tela ? (
          <button type="button" className={styles.inicio} onClick={() => (parteDor ? setParteDor(null) : irPara(null))}>
            <span aria-hidden>⌂</span> {parteDor ? "Voltar" : "Início"}
          </button>
        ) : (
          <button type="button" className={styles.inicio} onClick={() => setTeclado(true)} aria-label="Abrir o teclado para escrever">
            <span aria-hidden>⌨</span> Escrever
          </button>
        )}
        <button type="button" className={styles.naoEIsso} onClick={naoEIsso}>✋ Não é isso</button>
        <button type="button" className={styles.sim} onClick={sim}>👍 Sim</button>
        <button type="button" className={styles.nao} onClick={nao}>👎 Não</button>
        <button
          type="button"
          className={`${styles.engrenagem} ${segurando ? styles.segurando : ""}`}
          aria-label={familia ? "Sair do modo família" : "Segure para abrir o modo família"}
          onPointerDown={comecarSegurar}
          onPointerUp={soltarSegurar}
          onPointerLeave={soltarSegurar}
          onContextMenu={(e) => e.preventDefault()}
        >
          {familia ? "✓" : "⚙"}
        </button>
      </div>

      {familia && (
        <div className={styles.faixaFamilia}>
          <span><strong>Modo família.</strong> Toque num item para trocar a foto ou a frase. “Adicionar” abre a câmera.</span>
          <span className={styles.nuvem} data-status={nuvem}>
            {{ local: "📱 Só neste aparelho", salvo: "☁️ Salvo na nuvem", enviando: "☁️ Enviando…", pendente: "⏳ Aguardando internet", erro: "⚠️ Não sincronizou" }[nuvem]}
          </span>
          <button type="button" className={!token ? styles.primario : ""} onClick={() => setNuvemAberta(true)}>
            {token ? "Link do tablet" : "☁️ Salvar na nuvem"}
          </button>
          <button type="button" onClick={() => setConfigAberta(true)}>Configurações</button>
          <button type="button" onClick={() => { setFamilia(false); setConfigAberta(false); }}>Sair</button>
        </div>
      )}

      {tela && (
        <h1 className={styles.titulo}>
          <span aria-hidden>{tela.emoji}</span> {parteDor ? `${parteDor}. Quanto?` : tela.rotulo}
        </h1>
      )}

      <main className={styles.conteudo} aria-busy={!pronto}>{conteudo}</main>

      {/* destaque do que foi dito */}
      {destaque && !chamando && (
        <div className={styles.destaque} role="dialog" aria-live="assertive" onClick={() => setDestaque(null)}>
          {destaque.foto ? <img src={destaque.foto} alt="" /> : destaque.emoji ? <span className={styles.destaqueEmoji}>{destaque.emoji}</span> : null}
          <span className={styles.destaqueTexto}>{destaque.texto}</span>
          {pessoa && (
            <span className={styles.acoesPessoa} onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => dizer(`Chama ${pessoa.rotulo} aqui, por favor.`, pessoa.emoji, pessoa.foto, true)}>Chamar aqui</button>
              <button type="button" onClick={() => dizer(`Como está ${pessoa.rotulo}?`, pessoa.emoji, pessoa.foto, true)}>Como está?</button>
              <button type="button" onClick={() => dizer(`Quero ver ${pessoa.rotulo}.`, pessoa.emoji, pessoa.foto, true)}>Quero ver</button>
            </span>
          )}
        </div>
      )}

      {/* chamando */}
      {chamando && (
        <div className={styles.chamando} role="alertdialog" aria-label="Chamando alguém">
          <span className={styles.sino} aria-hidden>🔔</span>
          <p>{t("Preciso de ajuda!")}</p>
          <button type="button" onClick={pararDeChamar}>Já vim — desligar</button>
        </div>
      )}

      {pedirPin && token && (
        <PedirPin
          token={token}
          onOk={(pin) => { guardarPin(pin); setPedirPin(false); setFamilia(true); void sincronizar(); }}
          onFechar={() => setPedirPin(false)}
        />
      )}

      {nuvemAberta && (
        <SalvarNaNuvem
          token={token}
          onCriada={async (tk, pin) => {
            guardarToken(tk); guardarPin(pin);
            tokenRef.current = tk; setToken(tk);
            syncRef.current = { pendente: true, apagar: [] }; salvarSync(syncRef.current);
            await sincronizar();
            return syncRef.current.pendente === false;
          }}
          onFechar={() => setNuvemAberta(false)}
        />
      )}

      {config && <Configuracoes dados={dados} onMudar={atualizar} onFechar={() => setConfigAberta(false)} />}

      {edicao && (
        <EditorItem
          edicao={edicao}
          tela={dados.telas.find((tl) => tl.id === edicao.telaId)!}
          genero={g}
          onSalvar={salvarEdicao}
          onExcluir={excluirItem}
          onFechar={() => setEdicao(null)}
          testar={(s) => falar(t(s), dados.config.velocidadeVoz)}
        />
      )}

      {/* teclado do Caio, mantido para incentivar a escrita */}
      <TecladoGrande aberto={teclado} onFechar={() => setTeclado(false)} />

      {aviso && <div className={styles.aviso} onClick={() => setAviso("")}>{aviso}</div>}
    </div>
  );
};

// ---------- Editor de item (modo família) ----------

const EditorItem: React.FC<{
  edicao: NonNullable<Edicao>;
  tela: TelaPrancha;
  genero: "a" | "o";
  onSalvar: (i: ItemPrancha) => void;
  onExcluir: (telaId: string, id: string) => void;
  onFechar: () => void;
  testar: (s: string) => void;
}> = ({ edicao, tela, onSalvar, onExcluir, onFechar, testar }) => {
  const [item, setItem] = useState<ItemPrancha>(edicao.item);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const camera = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const pessoa = tela.tipo === "pessoas";

  const aoEscolher = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setCarregando(true); setErro("");
    try { const foto = await prepararFoto(f); setItem((i) => ({ ...i, foto, fotoBlob: undefined })); }
    catch (err) { setErro(err instanceof Error ? err.message : "Erro na foto."); }
    setCarregando(false);
  };

  const falaSugerida = (rotulo: string) =>
    pessoa ? rotulo : tela.id === "beber" || tela.id === "comer" ? `Quero ${rotulo.toLowerCase()}.` : rotulo + ".";

  const salvar = () => {
    const rotulo = item.rotulo.trim();
    if (!rotulo) { setErro("Escreva um nome."); return; }
    onSalvar({ ...item, rotulo, fala: (item.fala || "").trim() || falaSugerida(rotulo) });
  };

  return (
    <div className={styles.modalFundo} onClick={onFechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Editar item">
        <h2>{edicao.novo ? `Adicionar em “${tela.rotulo}”` : "Editar"}</h2>

        <div className={styles.fotoEditor}>
          <div className={styles.fotoPrevia}>
            {item.foto ? <img src={item.foto} alt="" /> : <span className={styles.emoji}>{item.emoji}</span>}
          </div>
          <div className={styles.fotoAcoes}>
            <button type="button" className={styles.primario} onClick={() => camera.current?.click()} disabled={carregando}>📷 Tirar foto</button>
            <button type="button" onClick={() => galeria.current?.click()} disabled={carregando}>🖼️ Escolher da galeria</button>
            {item.foto && <button type="button" onClick={() => setItem((i) => ({ ...i, foto: undefined, fotoBlob: undefined }))}>Remover foto</button>}
            <p className={styles.dica}>
              {pessoa ? "Rosto de perto, com luz boa. Peça licença à pessoa." : "Um objeto só, bem de perto, com luz boa e fundo liso. Use as coisas reais da casa."}
            </p>
          </div>
          <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={aoEscolher} />
          <input ref={galeria} type="file" accept="image/*" hidden onChange={aoEscolher} />
        </div>

        <label className={styles.campo}>
          <span>{pessoa ? "Nome ou apelido" : "Nome no botão"}</span>
          <input type="text" value={item.rotulo} onChange={(e) => setItem((i) => ({ ...i, rotulo: e.target.value }))} placeholder={pessoa ? "Ex.: Pedro" : "Ex.: Leite com chocolate"} autoFocus={edicao.novo} />
        </label>
        <label className={styles.campo}>
          <span>Frase falada em voz alta</span>
          <input type="text" value={item.fala} onChange={(e) => setItem((i) => ({ ...i, fala: e.target.value }))} placeholder={item.rotulo ? falaSugerida(item.rotulo) : "Deixe em branco para usar a sugestão"} />
        </label>
        <div className={styles.linha}>
          <button type="button" onClick={() => testar(item.fala || falaSugerida(item.rotulo || "…"))}>🔊 Ouvir</button>
          {!edicao.novo && (
            <label className={styles.check}>
              <input type="checkbox" checked={!!item.oculto} onChange={(e) => setItem((i) => ({ ...i, oculto: e.target.checked }))} />
              Esconder da tela
            </label>
          )}
        </div>
        {erro && <p className={styles.erro}>{erro}</p>}

        <div className={styles.rodapeModal}>
          {!edicao.novo && (
            <button type="button" className={styles.perigo} onClick={() => (confirmarExcluir ? onExcluir(edicao.telaId, item.id) : setConfirmarExcluir(true))}>
              {confirmarExcluir ? "Toque de novo para excluir" : "Excluir"}
            </button>
          )}
          <span className={styles.espaco} />
          <button type="button" onClick={onFechar}>Cancelar</button>
          <button type="button" className={styles.primario} onClick={salvar} disabled={carregando}>Salvar</button>
        </div>
      </div>
    </div>
  );
};

// ---------- Configurações (modo família) ----------

const Configuracoes: React.FC<{ dados: DadosPrancha; onMudar: (d: DadosPrancha) => void; onFechar: () => void }> = ({ dados, onMudar, onFechar }) => {
  const c = dados.config;
  const mudar = (p: Partial<typeof c>) => onMudar({ ...dados, config: { ...c, ...p } });
  const arquivo = useRef<HTMLInputElement>(null);
  const [copia, setCopia] = useState<DadosPrancha | null>(null);
  const [msg, setMsg] = useState("");

  const exportar = () => {
    const blob = new Blob([JSON.stringify(dados)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "prancha-copia.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const importar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    f.text().then((txt) => {
      try {
        const d = JSON.parse(txt) as DadosPrancha;
        if (d.versao !== 1 || !Array.isArray(d.telas)) throw new Error();
        setCopia(d); setMsg("");
      } catch { setMsg("Este arquivo não é uma cópia da prancha."); }
    });
  };

  return (
    <div className={styles.modalFundo} onClick={onFechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Configurações">
        <h2>Configurações</h2>

        <fieldset className={styles.grupo}>
          <legend>As frases falam como</legend>
          <label className={styles.check}><input type="radio" checked={c.genero === "a"} onChange={() => mudar({ genero: "a" })} /> Mulher (“estou cansada”)</label>
          <label className={styles.check}><input type="radio" checked={c.genero === "o"} onChange={() => mudar({ genero: "o" })} /> Homem (“estou cansado”)</label>
        </fieldset>

        <fieldset className={styles.grupo}>
          <legend>Modo simples</legend>
          <label className={styles.check}>
            <input type="checkbox" checked={c.modoSimples} onChange={(e) => mudar({ modoSimples: e.target.checked })} />
            Só 4 botões grandes (Beber, Comer, Dor, Chamar). Bom para dias mais difíceis.
          </label>
        </fieldset>

        <fieldset className={styles.grupo}>
          <legend>Tela</legend>
          <label className={styles.check}><input type="radio" checked={c.tema === "auto"} onChange={() => mudar({ tema: "auto" })} /> Escurece sozinha à noite (20h às 7h)</label>
          <label className={styles.check}><input type="radio" checked={c.tema === "claro"} onChange={() => mudar({ tema: "claro" })} /> Sempre clara</label>
          <label className={styles.check}><input type="radio" checked={c.tema === "noturno"} onChange={() => mudar({ tema: "noturno" })} /> Sempre escura</label>
        </fieldset>

        <fieldset className={styles.grupo}>
          <legend>Velocidade da voz</legend>
          <input type="range" min={0.6} max={1.2} step={0.05} value={c.velocidadeVoz} onChange={(e) => mudar({ velocidadeVoz: Number(e.target.value) })} />
          <button type="button" onClick={() => falar("Olá, esta é a minha voz.", c.velocidadeVoz)}>🔊 Ouvir</button>
        </fieldset>

        <fieldset className={styles.grupo}>
          <legend>Cópia de segurança</legend>
          <p className={styles.dica}>As fotos ficam só neste aparelho. Guarde uma cópia para não perder se trocar de tablet.</p>
          <div className={styles.linha}>
            <button type="button" onClick={exportar}>Baixar cópia</button>
            <button type="button" onClick={() => arquivo.current?.click()}>Restaurar cópia</button>
            <input ref={arquivo} type="file" accept="application/json" hidden onChange={importar} />
          </div>
          {copia && (
            <div className={styles.linha} style={{ marginTop: 8 }}>
              <span>Substituir a prancha deste aparelho pela cópia?</span>
              <button type="button" className={styles.perigo} onClick={() => { onMudar(copia); setCopia(null); setMsg("Cópia restaurada."); }}>Substituir</button>
              <button type="button" onClick={() => setCopia(null)}>Cancelar</button>
            </div>
          )}
          {msg && <p className={styles.dica}>{msg}</p>}
        </fieldset>

        <div className={styles.rodapeModal}>
          <span className={styles.espaco} />
          <button type="button" className={styles.primario} onClick={onFechar}>Pronto</button>
        </div>
      </div>
    </div>
  );
};

// ---------- PIN do modo família (prancha ligada à nuvem) ----------

const PedirPin: React.FC<{ token: string; onOk: (pin: string) => void; onFechar: () => void }> = ({ token, onOk, onFechar }) => {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const [conferindo, setConferindo] = useState(false);
  const conferir = async () => {
    if (!/^\d{6,10}$/.test(pin)) { setMsg("O PIN tem de 6 a 10 números."); return; }
    setConferindo(true); setMsg("");
    try {
      const r = await baixar(token, pin);
      if (r.podeEditar) onOk(pin); else setMsg("PIN incorreto.");
    } catch {
      setMsg("Sem internet. Para editar, conecte o aparelho e tente de novo.");
    }
    setConferindo(false);
  };
  return (
    <div className={styles.modalFundo} onClick={onFechar}>
      <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); void conferir(); }} role="dialog" aria-label="PIN do modo família">
        <h2>Modo família</h2>
        <p className={styles.dica}>Digite o PIN da família para trocar fotos e frases.</p>
        <label className={styles.campo}>
          <span>PIN</span>
          <input id="pin-familia" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} autoFocus />
        </label>
        {msg && <p className={styles.erro}>{msg}</p>}
        <div className={styles.rodapeModal}>
          <span className={styles.espaco} />
          <button type="button" onClick={onFechar}>Cancelar</button>
          <button type="submit" className={styles.primario} disabled={conferindo}>{conferindo ? "Conferindo…" : "Entrar"}</button>
        </div>
      </form>
    </div>
  );
};

// ---------- Salvar na nuvem / link do tablet ----------

const SalvarNaNuvem: React.FC<{
  token: string | null;
  onCriada: (token: string, pin: string) => Promise<boolean>;
  onFechar: () => void;
}> = ({ token, onCriada, onFechar }) => {
  const [codigo, setCodigo] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [msg, setMsg] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { try { setCodigo(localStorage.getItem("conversa-codigo-acesso") || ""); } catch { /* */ } }, []);

  const salvar = async () => {
    setMsg("");
    if (!codigo) { setMsg("Digite o código da equipe."); return; }
    if (!/^\d{6,10}$/.test(pin)) { setMsg("O PIN precisa ter de 6 a 10 números."); return; }
    if (pin !== pin2) { setMsg("Os dois PINs não são iguais."); return; }
    setEnviando(true);
    try {
      const tk = await criarNaNuvem(codigo, "Prancha da família", pin);
      try { localStorage.setItem("conversa-codigo-acesso", codigo); } catch { /* */ }
      const ok = await onCriada(tk, pin);
      if (!ok) setMsg("A prancha foi criada, mas as fotos ainda não subiram. Elas sobem sozinhas quando houver internet.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Não foi possível salvar na nuvem.");
    }
    setEnviando(false);
  };

  if (token) {
    const link = linkDaPrancha(token);
    const copiar = async () => {
      try { await navigator.clipboard.writeText(link); setCopiado(true); } catch { setMsg("Selecione o link e copie."); }
    };
    return (
      <div className={styles.modalFundo} onClick={onFechar}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Link do tablet">
          <h2>☁️ A prancha está na nuvem</h2>
          <p>Abra este link <strong>uma vez</strong> no tablet (e no celular de quem for tirar fotos). Depois é só abrir a prancha normalmente.</p>
          <p className={styles.linkTablet}>{link}</p>
          <div className={styles.linha}>
            <button type="button" className={styles.primario} onClick={copiar}>{copiado ? "Copiado ✓" : "Copiar link"}</button>
            <a className={styles.botaoLink} href={`https://wa.me/?text=${encodeURIComponent("Link da prancha: " + link)}`} target="_blank" rel="noopener noreferrer">Enviar por WhatsApp</a>
          </div>
          <p className={styles.dica}>Quem tiver o link vê a prancha. Para mudar fotos e frases, precisa do PIN. Não coloque o link em grupos abertos.</p>
          {msg && <p className={styles.erro}>{msg}</p>}
          <div className={styles.rodapeModal}><span className={styles.espaco} /><button type="button" onClick={onFechar}>Fechar</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalFundo} onClick={onFechar}>
      <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); void salvar(); }} role="dialog" aria-label="Salvar na nuvem">
        <h2>☁️ Salvar na nuvem</h2>
        <p>Assim as fotos e frases deste aparelho ficam guardadas com segurança e aparecem no tablet e no celular da família.</p>
        <label className={styles.campo}>
          <span>Código da equipe</span>
          <input id="nuvem-codigo" type="password" autoComplete="off" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        </label>
        <div className={styles.linha}>
          <label className={styles.campo} style={{ flex: 1 }}>
            <span>Escolha um PIN da família (6 a 10 números)</span>
            <input id="nuvem-pin" type="password" inputMode="numeric" autoComplete="new-password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          </label>
          <label className={styles.campo} style={{ flex: 1 }}>
            <span>Repita o PIN</span>
            <input id="nuvem-pin2" type="password" inputMode="numeric" autoComplete="new-password" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} />
          </label>
        </div>
        <p className={styles.dica}>O PIN é pedido para trocar fotos e frases. Guarde-o: ele não aparece de novo.</p>
        {msg && <p className={styles.erro}>{msg}</p>}
        <div className={styles.rodapeModal}>
          <span className={styles.espaco} />
          <button type="button" onClick={onFechar}>Cancelar</button>
          <button type="submit" className={styles.primario} disabled={enviando}>{enviando ? "Salvando…" : "Salvar na nuvem"}</button>
        </div>
      </form>
    </div>
  );
};
