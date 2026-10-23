"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PARTES, formatarTexto, Parte } from "@/data/perguntas";
import { Card } from "@/components/Card/Card";
import { Callout } from "@/components/Callout/Callout";
import styles from "./entrevista.module.css";

interface OutraResposta {
  id: string;
  nome: string;
  relacao: string;
  papel: string;
  respostas: Record<string, string>;
}

export const EntrevistaForm: React.FC = () => {
  const searchParams = useSearchParams();
  const token = (searchParams.get("c") || "").trim();

  // Estados dos dados do respondente
  const [respondenteId, setRespondenteId] = useState("");
  const [nome, setNome] = useState("");
  const [relacao, setRelacao] = useState("");
  const [pessoa, setPessoa] = useState("");
  const [papel, setPapel] = useState<"principal" | "complementar" | "">("");

  // Respostas às perguntas: chave "BLOCO_NUMERO" -> texto
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [consentimento, setConsentimento] = useState(false);

  // Estados de dados da família vindos da API
  const [nomeFamilia, setNomeFamilia] = useState("");
  const [outrosFamiliares, setOutrosFamiliares] = useState<OutraResposta[]>([]);
  const [carregandoFamilia, setCarregandoFamilia] = useState(false);

  // Feedback de envio
  const [salvando, setSalvando] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState("");
  const [msgErro, setMsgErro] = useState("");

  const storageKey = useMemo(() => `conversa-apoiada-${token}`, [token]);

  // Inicializa ID do dispositivo e restaura rascunho salvo localmente
  useEffect(() => {
    if (!token) return;

    try {
      const salvo = localStorage.getItem(storageKey);
      if (salvo) {
        const dados = JSON.parse(salvo);
        setRespondenteId(dados.id || crypto.randomUUID());
        setNome(dados.nome || "");
        setRelacao(dados.relacao || "");
        setPessoa(dados.pessoa || "");
        setPapel(dados.papel || "");
        setRespostas(dados.respostas || {});
        setConsentimento(!!dados.consentimento);
      } else {
        setRespondenteId(crypto.randomUUID());
      }
    } catch {
      setRespondenteId(crypto.randomUUID());
    }
  }, [token, storageKey]);

  // Carrega respostas já cadastradas por outros membros da mesma família
  useEffect(() => {
    if (!token) return;

    setCarregandoFamilia(true);
    fetch(`/api/respostas?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setNomeFamilia(data.familia || "");
          setOutrosFamiliares(data.respostas || []);

          // Se a pessoa ainda não informou como chamam quem teve AVC, tenta preencher com o que outro familiar usou
          if (!pessoa) {
            const outroComNome = (data.respostas as OutraResposta[])?.find(
              (r) => (r as unknown as { pessoa?: string }).pessoa
            );
            if (outroComNome && (outroComNome as unknown as { pessoa?: string }).pessoa) {
              setPessoa((outroComNome as unknown as { pessoa?: string }).pessoa || "");
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setCarregandoFamilia(false));
  }, [token, pessoa]);

  // Salva rascunho no localStorage a cada alteração
  useEffect(() => {
    if (!token || !respondenteId) return;

    const rascunho = {
      id: respondenteId,
      nome,
      relacao,
      pessoa,
      papel,
      respostas,
      consentimento,
      atualizadoEm: new Date().toISOString(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(rascunho));
    } catch {}
  }, [token, respondenteId, nome, relacao, pessoa, papel, respostas, consentimento, storageKey]);

  // Atualiza uma resposta individual
  const handleChangeResposta = (chave: string, valor: string) => {
    setRespostas((prev) => ({
      ...prev,
      [chave]: valor,
    }));
  };

  // Define a ordem das partes baseada no papel do familiar
  const partesOrdenadas: Parte[] = useMemo(() => {
    if (papel === "principal") {
      return PARTES;
    }
    // Quem apenas convive vê a Parte 2 (seu olhar) primeiro
    return [PARTES[1], PARTES[0]];
  }, [papel]);

  // Contagem de progresso
  const totalPerguntasVisiveis = useMemo(() => {
    return partesOrdenadas.reduce((acc, parte) => {
      return acc + parte.blocos.reduce((bAcc, bloco) => bAcc + bloco.qs.length, 0);
    }, 0);
  }, [partesOrdenadas]);

  const perguntasRespondidas = useMemo(() => {
    return Object.values(respostas).filter((v) => v && v.trim().length > 0).length;
  }, [respostas]);

  const porcentagemProgresso = totalPerguntasVisiveis > 0
    ? Math.min(100, Math.round((perguntasRespondidas / totalPerguntasVisiveis) * 100))
    : 0;

  // Envio final para o backend
  const handleEnviar = async () => {
    setMsgSucesso("");
    setMsgErro("");

    if (!consentimento) {
      setMsgErro("Por favor, marque a caixa de consentimento para enviar.");
      return;
    }

    if (!nome.trim()) {
      setMsgErro("Por favor, preencha o seu nome no início da página.");
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        token,
        id: respondenteId,
        respondente: {
          nome: nome.trim(),
          relacao: relacao.trim(),
          pessoa: pessoa.trim(),
        },
        papel,
        consentimento: true,
        respostas,
      };

      const res = await fetch("/api/respostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.erro || "Falha ao gravar respostas");
      }

      setMsgSucesso("Suas respostas foram gravadas com sucesso! Você pode voltar a qualquer momento neste link para atualizar ou complementar.");
    } catch (err: unknown) {
      setMsgErro(err instanceof Error ? err.message : "Erro na gravação");
    } finally {
      setSalvando(false);
    }
  };

  // Exportar rascunho em Markdown
  const handleDownloadMd = () => {
    let md = `# Conversa Apoiada — Respostas\n\n`;
    md += `**Família:** ${nomeFamilia || "Não identificada"}\n`;
    md += `**Respondente:** ${nome || "Anônimo"} (${relacao || "Sem relação informada"})\n`;
    md += `**Pessoa:** ${pessoa || "a pessoa"}\n`;
    md += `**Papel:** ${papel === "principal" ? "Acompanha o dia a dia" : "Convive com a pessoa"}\n\n`;

    partesOrdenadas.forEach((parte) => {
      md += `## ${formatarTexto(parte.titulo, pessoa)}\n\n`;
      parte.blocos.forEach((bloco) => {
        md += `### Bloco ${bloco.id} · ${bloco.titulo}\n\n`;
        bloco.qs.forEach((q, idx) => {
          const qId = `${bloco.id}_${idx + 1}`;
          const resp = respostas[qId] || "*(em branco)*";
          md += `**${idx + 1}. ${formatarTexto(q, pessoa)}**\n\n${resp}\n\n`;
        });
      });
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversa-apoiada-${nome.trim() || "respostas"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <div className="wrap" style={{ padding: "48px 16px" }}>
        <Callout type="warm">
          <p>
            <strong>Esta entrevista é acessada exclusivamente via link de convite.</strong>
          </p>
          <p>
            Se você é membro de uma família participante, clique no link que foi enviado a você. Se não tiver um link, entre em contato com quem te convidou.
          </p>
        </Callout>
        <p>
          <Link href="/">← Voltar para a página informativa das famílias</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* 3 Pilares da Entrevista */}
      <section className={styles.section}>
        <div className={styles.grid3}>
          <Card title="Leva uns 15 a 25 minutos">
            <p>Pode parar e continuar depois neste mesmo aparelho. O que você escrever fica guardado automaticamente enquanto isso.</p>
          </Card>
          <Card title="Não existe resposta certa">
            <p>Escreva do seu jeito. Pode deixar perguntas em branco se não souber ou preferir não responder.</p>
          </Card>
          <Card title="A família responde junto">
            <p>Cada familiar usa o mesmo link. Você vê o que os outros já contaram e pode complementar sem precisar repetir.</p>
          </Card>
        </div>
      </section>

      {/* Caixa de familiares que já responderam */}
      {outrosFamiliares.length > 0 && (
        <Callout>
          <strong>Quem da família já respondeu:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: "1.2em" }}>
            {outrosFamiliares.map((outro) => (
              <li key={outro.id}>
                {outro.nome} ({outro.relacao}) — {outro.papel === "principal" ? "acompanha o dia a dia" : "convive"}
              </li>
            ))}
          </ul>
          <p style={{ marginTop: 8, fontSize: "0.95rem" }}>
            As respostas anteriores aparecem logo abaixo de cada pergunta para que você possa complementar ou dar o seu ponto de vista.
          </p>
        </Callout>
      )}

      {/* Dados do Respondente */}
      <section className={styles.section}>
        <h2>Sobre você</h2>
        {nomeFamilia && (
          <p style={{ color: "var(--accent)", fontWeight: 700 }}>
            Convite para: {nomeFamilia}
          </p>
        )}

        <div className={styles.metaFields}>
          <label className={styles.field}>
            <span>Seu nome (ou como prefere ser chamado/a)</span>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex.: Ana, João"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Sua relação com a pessoa (filha, esposo, neto…)</span>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex.: Filha, companheiro, neta"
              value={relacao}
              onChange={(e) => setRelacao(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Como vocês chamam a pessoa que teve o AVC?</span>
            <input
              type="text"
              className={styles.input}
              placeholder="Ex.: Dona Maria, vô João"
              value={pessoa}
              onChange={(e) => setPessoa(e.target.value)}
            />
          </label>
        </div>

        <h3 style={{ marginTop: 24 }}>Qual destas frases combina mais com você?</h3>
        <div className={styles.choice}>
          <label
            className={`${styles.choiceLabel} ${
              papel === "principal" ? styles.choiceSelected : ""
            }`}
          >
            <input
              type="radio"
              name="papel"
              value="principal"
              checked={papel === "principal"}
              onChange={() => setPapel("principal")}
              className={styles.radioInput}
            />
            <span className={styles.choiceText}>
              <strong>Sou quem mais acompanha o dia a dia de {formatarTexto("{p}", pessoa)}.</strong>
              <small>Você responde as duas partes: a rotina do dia a dia e o seu olhar pessoal.</small>
            </span>
          </label>

          <label
            className={`${styles.choiceLabel} ${
              papel === "complementar" ? styles.choiceSelected : ""
            }`}
          >
            <input
              type="radio"
              name="papel"
              value="complementar"
              checked={papel === "complementar"}
              onChange={() => setPapel("complementar")}
              className={styles.radioInput}
            />
            <span className={styles.choiceText}>
              <strong>Convivo com {formatarTexto("{p}", pessoa)}, mas outra pessoa acompanha mais a rotina.</strong>
              <small>Você responde primeiro a parte do seu olhar. A parte do dia a dia fica opcional caso queira acrescentar algo.</small>
            </span>
          </label>
        </div>
      </section>

      {/* Renderização das Perguntas */}
      {papel && (
        <section className={styles.section}>
          {/* Barra de Progresso */}
          <div className={styles.progressContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${porcentagemProgresso}%` }}
            />
          </div>
          <div className={styles.progressLabel}>
            {perguntasRespondidas} de {totalPerguntasVisiveis} perguntas respondidas ({porcentagemProgresso}%) · Rascunho salvo no navegador
          </div>

          {partesOrdenadas.map((parte) => (
            <div key={parte.id} style={{ marginBottom: 36 }}>
              <h2>{formatarTexto(parte.titulo, pessoa)}</h2>
              <p style={{ color: "var(--muted)", marginBottom: 16 }}>
                {formatarTexto(parte.sub, pessoa)}
              </p>

              {parte.blocos.map((bloco) => {
                const respondidasNoBloco = bloco.qs.filter((_, idx) => {
                  const qId = `${bloco.id}_${idx + 1}`;
                  return respostas[qId]?.trim().length > 0;
                }).length;

                return (
                  <details
                    key={bloco.id}
                    className={styles.block}
                    open={parte.id === "olhar" || papel === "principal"}
                  >
                    <summary className={styles.summary}>
                      <span
                        className={`${styles.letterBadge} ${
                          bloco.privado ? styles.badgePrivate : ""
                        }`}
                      >
                        {bloco.id}
                      </span>
                      <span>
                        Bloco {bloco.id} · {bloco.titulo}
                        {bloco.privado && (
                          <span style={{ fontSize: "0.85rem", color: "var(--warm)", marginLeft: 8 }}>
                            (Sigiloso · só a equipe vê)
                          </span>
                        )}
                      </span>
                      <span className={styles.blockCount}>
                        {respondidasNoBloco}/{bloco.qs.length} respondidas
                      </span>
                    </summary>

                    <div className={styles.blockBody}>
                      <p className={styles.blockWhy}>Por que perguntamos isso: {bloco.porque}</p>

                      {bloco.qs.map((q, qIndex) => {
                        const chave = `${bloco.id}_${qIndex + 1}`;

                        // Busca se algum outro familiar respondeu essa questão (apenas para blocos não-privados)
                        const respostasOutros = !bloco.privado
                          ? outrosFamiliares
                              .map((outro) => ({
                                autor: `${outro.nome} (${outro.relacao})`,
                                texto: outro.respostas[chave],
                              }))
                              .filter((item) => item.texto && item.texto.trim().length > 0)
                          : [];

                        return (
                          <div key={chave} className={styles.questionItem}>
                            <label className={styles.questionLabel} htmlFor={chave}>
                              <span className={styles.questionNum}>{qIndex + 1}.</span>
                              {formatarTexto(q, pessoa)}
                            </label>

                            {/* Respostas de outros familiares */}
                            {respostasOutros.length > 0 && (
                              <div className={styles.othersList}>
                                {respostasOutros.map((item, i) => (
                                  <div key={i} className={styles.otherItem}>
                                    <span className={styles.otherAuthor}>{item.autor} contou:</span>
                                    {item.texto}
                                  </div>
                                ))}
                              </div>
                            )}

                            <textarea
                              id={chave}
                              className={styles.textarea}
                              placeholder={
                                respostasOutros.length > 0
                                  ? "Deseja complementar ou contar como vê essa situação?"
                                  : "Escreva com as suas palavras (ou deixe em branco se preferir)"
                              }
                              value={respostas[chave] || ""}
                              onChange={(e) => handleChangeResposta(chave, e.target.value)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </details>
                );
              })}
            </div>
          ))}

          {/* Consentimento e Envio */}
          <div className={styles.sendBar}>
            <label className={styles.consentLabel}>
              <input
                type="checkbox"
                className={styles.consentInput}
                checked={consentimento}
                onChange={(e) => setConsentimento(e.target.checked)}
              />
              <span>
                Concordo que minhas respostas sejam guardadas e utilizadas para o planejamento do aplicativo de comunicação. Sei que os familiares com este mesmo link poderão ler o que escrevi (com exceção do bloco “Como é para você”, que é sigiloso e acessado apenas pela equipe de pesquisa). Sei que a participação é voluntária e que posso solicitar a exclusão de minhas respostas a qualquer momento.
              </span>
            </label>

            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleEnviar}
                disabled={salvando}
              >
                {salvando ? "Enviando..." : "Enviar respostas"}
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={handleDownloadMd}
              >
                Baixar uma cópia (Markdown)
              </button>
            </div>

            {msgSucesso && (
              <div className={`${styles.feedbackMsg} ${styles.feedbackSuccess}`}>
                {msgSucesso}
              </div>
            )}
            {msgErro && (
              <div className={`${styles.feedbackMsg} ${styles.feedbackError}`}>
                {msgErro}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
