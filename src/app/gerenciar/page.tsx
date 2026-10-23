"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TOPICOS_INICIAIS, TopicoDado } from "@/data/dadosIniciais";
import styles from "./gerenciar.module.css";

interface ItemDB {
  id: string;
  nome: string;
  imagem: string;
  categoriaId: string;
}

export default function GerenciarPage() {
  // Categorias locais/db
  const [topicos, setTopicos] = useState<TopicoDado[]>(TOPICOS_INICIAIS);

  // Form: Nova Categoria
  const [novoNomeCat, setNovoNomeCat] = useState("");
  const [novoIconeCat, setNovoIconeCat] = useState("📁");
  const [paiSelecionado, setPaiSelecionado] = useState("");

  // Form: Novo Item
  const [categoriaAlvo, setCategoriaAlvo] = useState("salgada");
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemImagem, setNovoItemImagem] = useState("🍽️");

  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Carrega personalizações salvas no navegador
    try {
      const salvo = localStorage.getItem("conversa-db-custom");
      if (salvo) {
        setTopicos(JSON.parse(salvo));
      }
    } catch {}
  }, []);

  const salvarAlteracoes = (novosDados: TopicoDado[]) => {
    setTopicos(novosDados);
    try {
      localStorage.setItem("conversa-db-custom", JSON.stringify(novosDados));
    } catch {}
  };

  // 1. Criar nova categoria ou subcategoria
  const handleCriarCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNomeCat.trim()) return;

    const idGerado = "cat_" + Date.now();

    if (!paiSelecionado) {
      // Cria como categoria principal
      const nova: TopicoDado = {
        id: idGerado,
        nome: novoNomeCat.trim(),
        icone: novoIconeCat.trim() || "📁",
        cor: "#1f6f62",
        tipo: "itens",
        itens: [],
      };
      const atualizado = [...topicos, nova];
      salvarAlteracoes(atualizado);
    } else {
      // Cria como subcategoria dentro da categoria pai
      const atualizado = topicos.map((topico) => {
        if (topico.id === paiSelecionado) {
          const subs = topico.subcategorias || [];
          return {
            ...topico,
            tipo: "subcategorias" as const,
            subcategorias: [
              ...subs,
              {
                id: idGerado,
                nome: novoNomeCat.trim(),
                icone: novoIconeCat.trim() || "📁",
                itens: [],
              },
            ],
          };
        }
        return topico;
      });
      salvarAlteracoes(atualizado);
    }

    setNovoNomeCat("");
    setFeedback("Categoria criada com sucesso!");
    setTimeout(() => setFeedback(""), 3000);
  };

  // 2. Adicionar novo item
  const handleAdicionarItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoItemNome.trim() || !categoriaAlvo) return;

    const novoItem = {
      id: "item_" + Date.now(),
      nome: novoItemNome.trim(),
      imagem: novoItemImagem.trim() || "📌",
      fala: `Quero ${novoItemNome.trim()}`,
    };

    const atualizado = topicos.map((topico) => {
      // Se for categoria direta de itens
      if (topico.id === categoriaAlvo && topico.itens) {
        return {
          ...topico,
          itens: [...topico.itens, novoItem],
        };
      }
      // Se tiver subcategorias
      if (topico.subcategorias) {
        const subsAtualizadas = topico.subcategorias.map((sub) => {
          if (sub.id === categoriaAlvo) {
            return {
              ...sub,
              itens: [...sub.itens, novoItem],
            };
          }
          return sub;
        });
        return {
          ...topico,
          subcategorias: subsAtualizadas,
        };
      }
      return topico;
    });

    salvarAlteracoes(atualizado);
    setNovoItemNome("");
    setFeedback(`Item "${novoItem.nome}" adicionado com sucesso!`);
    setTimeout(() => setFeedback(""), 3000);
  };

  // 3. Remover item
  const handleRemoverItem = (itemId: string) => {
    const atualizado = topicos.map((topico) => {
      if (topico.itens) {
        return {
          ...topico,
          itens: topico.itens.filter((i) => i.id !== itemId),
        };
      }
      if (topico.subcategorias) {
        return {
          ...topico,
          subcategorias: topico.subcategorias.map((sub) => ({
            ...sub,
            itens: sub.itens.filter((i) => i.id !== itemId),
          })),
        };
      }
      return topico;
    });

    salvarAlteracoes(atualizado);
    setFeedback("Item removido!");
    setTimeout(() => setFeedback(""), 3000);
  };

  // 4. Remover categoria
  const handleRemoverCategoria = (catId: string) => {
    const atualizado = topicos
      .filter((t) => t.id !== catId)
      .map((t) => {
        if (t.subcategorias) {
          return {
            ...t,
            subcategorias: t.subcategorias.filter((s) => s.id !== catId),
          };
        }
        return t;
      });

    salvarAlteracoes(atualizado);
    setFeedback("Categoria removida!");
    setTimeout(() => setFeedback(""), 3000);
  };

  // Lista plana de categorias e subcategorias para o select
  const categoriasDisponiveis: { id: string; nome: string }[] = [];
  topicos.forEach((t) => {
    if (t.tipo === "itens" || t.tipo === "sentimentos") {
      categoriasDisponiveis.push({ id: t.id, nome: `${t.icone} ${t.nome}` });
    }
    if (t.subcategorias) {
      t.subcategorias.forEach((s) => {
        categoriasDisponiveis.push({ id: s.id, nome: `${t.icone} ${t.nome} → ${s.icone} ${s.nome}` });
      });
    }
  });

  return (
    <div className={styles.container}>
      <div className={styles.topHeader}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.8rem" }}>⚙️ Gerenciar Banco de Dados</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Adicione novas categorias, subcategorias ou personalize os itens falados do app.
          </p>
        </div>
        <Link href="/" className={styles.btnBack}>
          ← Voltar ao App
        </Link>
      </div>

      {feedback && (
        <div style={{ padding: "12px 16px", background: "var(--accent-soft)", color: "var(--accent)", borderRadius: 10, fontWeight: 700, marginBottom: 20 }}>
          {feedback}
        </div>
      )}

      {/* 1. Criar Nova Categoria / Subcategoria */}
      <section className={styles.cardSection}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem" }}>➕ Criar Nova Categoria ou Subcategoria</h2>
        <form onSubmit={handleCriarCategoria} className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="catNome">Nome da Categoria</label>
            <input
              id="catNome"
              type="text"
              className={styles.input}
              placeholder="Ex.: Sobremesas, Cuidados..."
              value={novoNomeCat}
              onChange={(e) => setNovoNomeCat(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="catIcone">Emoji / Ícone</label>
            <input
              id="catIcone"
              type="text"
              className={styles.input}
              placeholder="Ex.: 🍰, 💊"
              value={novoIconeCat}
              onChange={(e) => setNovoIconeCat(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="catPai">Categoria Pai (Opcional)</label>
            <select
              id="catPai"
              className={styles.select}
              value={paiSelecionado}
              onChange={(e) => setPaiSelecionado(e.target.value)}
            >
              <option value="">Nenhuma (Categoria Principal)</option>
              {topicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icone} {t.nome}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ height: 50 }}>
            Criar Categoria
          </button>
        </form>
      </section>

      {/* 2. Adicionar Item na Categoria */}
      <section className={styles.cardSection}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem" }}>➕ Adicionar Novo Item</h2>
        <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: "0.95rem" }}>
          Tabela simples do banco: <strong>Id do item</strong>, <strong>Nome do item</strong> e <strong>Imagem do item</strong>.
        </p>

        <form onSubmit={handleAdicionarItem} className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="itemCat">Onde adicionar?</label>
            <select
              id="itemCat"
              className={styles.select}
              value={categoriaAlvo}
              onChange={(e) => setCategoriaAlvo(e.target.value)}
            >
              {categoriasDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="itemNome">Nome do Item</label>
            <input
              id="itemNome"
              type="text"
              className={styles.input}
              placeholder="Ex.: Suco de Laranja, Torta..."
              value={novoItemNome}
              onChange={(e) => setNovoItemNome(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="itemImg">Imagem / Emoji</label>
            <input
              id="itemImg"
              type="text"
              className={styles.input}
              placeholder="Ex.: 🍊, 🥧"
              value={novoItemImagem}
              onChange={(e) => setNovoItemImagem(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.btnPrimary} style={{ height: 50 }}>
            Salvar Item
          </button>
        </form>
      </section>

      {/* 3. Gerenciador de Categorias e Itens Existentes */}
      <section className={styles.cardSection}>
        <h2 style={{ margin: "0 0 16px", fontSize: "1.4rem" }}>📋 Categorias e Itens Cadastrados</h2>

        <div className={styles.categoryList}>
          {topicos.map((topico) => (
            <div key={topico.id} className={styles.categoryItem}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryTitle}>
                  <span>{topico.icone}</span> {topico.nome}
                </span>
                <button
                  type="button"
                  className={styles.btnDelete}
                  onClick={() => handleRemoverCategoria(topico.id)}
                >
                  Excluir Categoria
                </button>
              </div>

              {/* Se tiver subcategorias */}
              {topico.subcategorias && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                  {topico.subcategorias.map((sub) => (
                    <div key={sub.id} style={{ background: "var(--surface)", padding: 14, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong>{sub.icone} {sub.nome} ({sub.itens.length} itens)</strong>
                        <button
                          type="button"
                          className={styles.btnDelete}
                          onClick={() => handleRemoverCategoria(sub.id)}
                        >
                          Excluir Subcategoria
                        </button>
                      </div>

                      <div className={styles.itemsGrid}>
                        {sub.itens.map((it) => (
                          <div key={it.id} className={styles.itemBox}>
                            <span className={styles.itemContent}>
                              <span>{it.imagem}</span>
                              <span>{it.nome}</span>
                            </span>
                            <button
                              type="button"
                              className={styles.btnDeleteItem}
                              onClick={() => handleRemoverItem(it.id)}
                              title="Remover este item"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Se tiver itens diretos */}
              {topico.itens && (
                <div className={styles.itemsGrid}>
                  {topico.itens.map((it) => (
                    <div key={it.id} className={styles.itemBox}>
                      <span className={styles.itemContent}>
                        <span>{it.imagem}</span>
                        <span>{it.nome}</span>
                      </span>
                      <button
                        type="button"
                        className={styles.btnDeleteItem}
                        onClick={() => handleRemoverItem(it.id)}
                        title="Remover este item"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
