"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import styles from "./PranchaComunicao.module.css";

interface ItemPrancha {
  id: string;
  emoji: string;
  texto: string;
  fala: string;
}

interface CategoriaPrancha {
  id: string;
  nome: string;
  emoji: string;
  itens: ItemPrancha[];
}

const CATEGORIAS: CategoriaPrancha[] = [
  {
    id: "necessidades",
    nome: "Necessidades",
    emoji: "🚨",
    itens: [
      { id: "agua", emoji: "💧", texto: "Água", fala: "Quero beber água" },
      { id: "fome", emoji: "🍽️", texto: "Comer / Fome", fala: "Estou com fome, quero comer" },
      { id: "banheiro", emoji: "🚻", texto: "Banheiro", fala: "Preciso ir ao banheiro" },
      { id: "dormir", emoji: "🛌", texto: "Dormir / Descansar", fala: "Estou cansado, quero me deitar" },
      { id: "frio", emoji: "🥶", texto: "Frio", fala: "Estou com frio, pode me cobrir?" },
      { id: "calor", emoji: "🥵", texto: "Calor", fala: "Estou com calor" },
      { id: "remedio", emoji: "💊", texto: "Remédio", fala: "Está na hora do meu remédio" },
      { id: "trocar_posicao", emoji: "🔄", texto: "Mudar de Posição", fala: "Quero mudar de posição, está desconfortável" },
    ],
  },
  {
    id: "saude",
    nome: "Dor e Saúde",
    emoji: "🩺",
    itens: [
      { id: "dor_cabeca", emoji: "🤕", texto: "Dor de Cabeça", fala: "Estou com dor de cabeça" },
      { id: "dor_corpo", emoji: "⚡", texto: "Dor no Corpo", fala: "Estou sentindo dor aqui" },
      { id: "tontura", emoji: "💫", texto: "Tontura", fala: "Estou sentindo tontura" },
      { id: "falta_ar", emoji: "🫁", texto: "Falta de Ar", fala: "Estou com falta de ar" },
      { id: "enjoo", emoji: "🤢", texto: "Enjoo", fala: "Estou com enjoo no estômago" },
      { id: "fono", emoji: "👩‍⚕️", texto: "Chamar Fono / Médico", fala: "Preciso falar com a fonoaudióloga ou médico" },
    ],
  },
  {
    id: "sentimentos",
    nome: "Sentimentos",
    emoji: "❤️",
    itens: [
      { id: "feliz", emoji: "😊", texto: "Feliz / Bem", fala: "Estou me sentindo bem e feliz" },
      { id: "triste", emoji: "😢", texto: "Triste", fala: "Estou triste hoje" },
      { id: "chateado", emoji: "😠", texto: "Chateado / Bravo", fala: "Estou chateado" },
      { id: "medo", emoji: "😨", texto: "Com Medo", fala: "Estou com medo ou inseguro" },
      { id: "amor", emoji: "❤️", texto: "Amo Vocês", fala: "Eu amo muito vocês" },
      { id: "abraco", emoji: "🫂", texto: "Preciso de Abraço", fala: "Preciso de um abraço e carinho" },
      { id: "tempo_sozinho", emoji: "⏳", texto: "Ficar Quietinho", fala: "Quero ficar um pouco quieto e sozinho" },
    ],
  },
  {
    id: "social",
    nome: "Conversa",
    emoji: "💬",
    itens: [
      { id: "bom_dia", emoji: "☀️", texto: "Bom dia!", fala: "Bom dia!" },
      { id: "boa_tarde", emoji: "🌤️", texto: "Boa tarde!", fala: "Boa tarde!" },
      { id: "boa_noite", emoji: "🌙", texto: "Boa noite!", fala: "Boa noite!" },
      { id: "como_vai", emoji: "🤝", texto: "Como você está?", fala: "Como você está?" },
      { id: "tv_musica", emoji: "📺", texto: "Ver TV / Música", fala: "Quero assistir televisão ou ouvir uma música" },
      { id: "passear", emoji: "🚶", texto: "Passear", fala: "Vamos passear ou tomar um ar fresco?" },
      { id: "noticias", emoji: "📰", texto: "O que aconteceu?", fala: "Me conte as novidades, o que está acontecendo?" },
    ],
  },
  {
    id: "familia",
    nome: "Chamar Família",
    emoji: "👥",
    itens: [
      { id: "chamar_esposo", emoji: "💍", texto: "Meu Bem / Cônjuge", fala: "Vem aqui, meu bem!" },
      { id: "chamar_filhos", emoji: "👶", texto: "Meus Filhos", fala: "Chame meus filhos, por favor" },
      { id: "chamar_cuidador", emoji: "🙋", texto: "Cuidador(a)", fala: "Preciso da ajuda de quem está cuidando" },
      { id: "socorro", emoji: "🔔", texto: "Ajuda Urgente!", fala: "Por favor, venham aqui agora! Preciso de ajuda urgente!" },
    ],
  },
];

export const PranchaComunicao: React.FC = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState("necessidades");
  const [fraseConstruida, setFraseConstruida] = useState<string[]>([]);
  const [textoManual, setTextoManual] = useState("");

  // Função utilitária para falar em voz alta via Web Speech API
  const falarTexto = useCallback((mensagem: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Interrompe fala anterior se houver
    const utterance = new SpeechSynthesisUtterance(mensagem);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9; // Levemente mais pausada para facilitar compreensão
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Falar ação rápida direta (Sim, Não, Obrigado, Ajuda)
  const handleQuickAction = (texto: string) => {
    falarTexto(texto);
  };

  // Ao clicar num cartão da prancha: fala e adiciona à frase
  const handleSelecionarItem = (item: ItemPrancha) => {
    falarTexto(item.fala);
    setFraseConstruida((prev) => [...prev, item.texto]);
  };

  // Falar a frase inteira montada
  const handleFalarFraseCompleta = () => {
    if (textoManual.trim()) {
      falarTexto(textoManual.trim());
      setTextoManual("");
      return;
    }

    if (fraseConstruida.length > 0) {
      const fraseTexto = fraseConstruida.join(" ");
      falarTexto(fraseTexto);
    }
  };

  const handleLimparFrase = () => {
    setFraseConstruida([]);
    setTextoManual("");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const categoriaAtual = CATEGORIAS.find((c) => c.id === categoriaAtiva) || CATEGORIAS[0];

  return (
    <div className={styles.container}>
      {/* 1. Botões de Resposta Imediata (Sim / Não / Obrigado / Ajuda) */}
      <div className={styles.quickActions}>
        <button
          type="button"
          className={`${styles.quickBtn} ${styles.btnSim}`}
          onClick={() => handleQuickAction("Sim!")}
          aria-label="Responder Sim"
        >
          <span>👍</span>
          <span>SIM</span>
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${styles.btnNao}`}
          onClick={() => handleQuickAction("Não!")}
          aria-label="Responder Não"
        >
          <span>👎</span>
          <span>NÃO</span>
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${styles.btnObrigado}`}
          onClick={() => handleQuickAction("Muito obrigado!")}
          aria-label="Agradecer"
        >
          <span>🙏</span>
          <span>OBRIGADO</span>
        </button>

        <button
          type="button"
          className={`${styles.quickBtn} ${styles.btnAjuda}`}
          onClick={() => handleQuickAction("Por favor, me ajude aqui!")}
          aria-label="Pedir ajuda"
        >
          <span>🆘</span>
          <span>ME AJUDE</span>
        </button>
      </div>

      {/* 2. Barra de Construção de Frase / Voz Alta */}
      <div className={styles.speechBar}>
        <div className={styles.speechDisplay}>
          {fraseConstruida.length === 0 && !textoManual && (
            <span className={styles.placeholder}>
              Toque nos cartões abaixo para montar sua frase e falar em voz alta...
            </span>
          )}

          {fraseConstruida.map((palavra, index) => (
            <span key={index} className={styles.wordToken}>
              {palavra}
            </span>
          ))}

          {textoManual && <span>{textoManual}</span>}
        </div>

        <div className={styles.controlsRow}>
          <button
            type="button"
            className={styles.btnSpeak}
            onClick={handleFalarFraseCompleta}
          >
            <span>🔊</span>
            <span>Falar Frase</span>
          </button>

          <button
            type="button"
            className={styles.btnControl}
            onClick={handleLimparFrase}
          >
            🗑️ Limpar
          </button>

          <input
            type="text"
            className={styles.customInput}
            placeholder="Ou digite algo aqui para o app falar..."
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleFalarFraseCompleta();
            }}
          />
        </div>
      </div>

      {/* 3. Abas de Categorias */}
      <div className={styles.categoryTabs} role="tablist">
        {CATEGORIAS.map((cat) => {
          const isActive = cat.id === categoriaAtiva;
          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              className={`${styles.categoryTab} ${isActive ? styles.activeTab : ""}`}
              onClick={() => setCategoriaAtiva(cat.id)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.nome}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Grade de Cartões da Categoria Selecionada */}
      <div className={styles.boardGrid}>
        {categoriaAtual.itens.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.cardItem}
            onClick={() => handleSelecionarItem(item)}
          >
            <span className={styles.cardEmoji}>{item.emoji}</span>
            <span className={styles.cardText}>{item.texto}</span>
          </button>
        ))}
      </div>

      {/* 5. Banner de Integração com a Entrevista Familiar */}
      <div className={styles.interviewBanner}>
        <div>
          <h3 style={{ margin: "0 0 4px" }}>📋 Entrevista e Personalização com a Família</h3>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
            A família pode responder à pesquisa para personalizar os cartões com nomes reais e necessidades específicas.
          </p>
        </div>
        <div>
          <Link
            href="/entrevista"
            style={{
              display: "inline-block",
              background: "var(--accent-soft)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "10px",
              padding: "10px 18px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
            }}
          >
            Ir para Entrevista Familiar →
          </Link>
        </div>
      </div>
    </div>
  );
};
