export interface ItemDado {
  id: string;
  nome: string;
  imagem: string; // Emoji representativo ou URL de imagem
  fala?: string;  // Frase dita em voz alta pelo sintetizador de voz
}

export interface SubcategoriaDado {
  id: string;
  nome: string;
  icone: string;
  itens: ItemDado[];
}

export interface TopicoDado {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  tipo: "subcategorias" | "itens" | "sentimentos" | "dor";
  subcategorias?: SubcategoriaDado[];
  itens?: ItemDado[];
}

export const TOPICOS_INICIAIS: TopicoDado[] = [
  {
    id: "comida",
    nome: "Comida",
    icone: "🍲",
    cor: "#b5552b",
    tipo: "subcategorias",
    subcategorias: [
      {
        id: "salgada",
        nome: "Comida Salgada",
        icone: "🥣",
        itens: [
          { id: "sopa", nome: "Sopa quentinha", imagem: "🥣", fala: "Quero tomar uma sopa quentinha" },
          { id: "arroz_feijao", nome: "Arroz e Feijão", imagem: "🍛", fala: "Quero comer arroz com feijão" },
          { id: "frango", nome: "Frango", imagem: "🍗", fala: "Quero comer frango" },
          { id: "carne", nome: "Carne macia", imagem: "🥩", fala: "Quero comer carne moída ou macia" },
          { id: "legumes", nome: "Legumes / Purê", imagem: "🥔", fala: "Quero comer legumes ou purê" },
          { id: "pao", nome: "Pãozinho", imagem: "🍞", fala: "Quero comer um pãozinho" },
          { id: "ovos", nome: "Ovo mexido", imagem: "🍳", fala: "Quero comer ovo mexido" },
        ],
      },
      {
        id: "doce",
        nome: "Comida Doce",
        icone: "🍮",
        itens: [
          { id: "pudim", nome: "Pudim", imagem: "🍮", fala: "Quero comer pudim" },
          { id: "fruta", nome: "Fruta picada", imagem: "🍎", fala: "Quero comer fruta picada" },
          { id: "bolo", nome: "Bolo", imagem: "🍰", fala: "Quero um pedaço de bolo" },
          { id: "gelatina", nome: "Gelatina", imagem: "🍧", fala: "Quero comer gelatina" },
          { id: "sorvete", nome: "Sorvete", imagem: "🍨", fala: "Quero um sorvete" },
          { id: "doce_leite", nome: "Doce de Leite", imagem: "🍯", fala: "Quero um docinho de leite" },
        ],
      },
    ],
  },
  {
    id: "bebida",
    nome: "Bebida",
    icone: "🥤",
    cor: "#1f6f62",
    tipo: "itens",
    itens: [
      { id: "agua", nome: "Água fresca", imagem: "💧", fala: "Quero beber água bem fresquinha" },
      { id: "cafe", nome: "Café com leite", imagem: "☕", fala: "Quero um cafezinho com leite" },
      { id: "suco", nome: "Suco natural", imagem: "🧃", fala: "Quero um copo de suco" },
      { id: "cha", nome: "Chá morno", imagem: "🍵", fala: "Quero tomar um chá quentinho" },
      { id: "leite", nome: "Leite morno", imagem: "🥛", fala: "Quero beber leite morno" },
      { id: "agua_coco", nome: "Água de coco", imagem: "🥥", fala: "Quero água de coco" },
    ],
  },
  {
    id: "pessoas",
    nome: "Pessoas",
    icone: "👥",
    cor: "#3b5998",
    tipo: "subcategorias",
    subcategorias: [
      {
        id: "filhos",
        nome: "Filhos",
        icone: "👦",
        itens: [
          { id: "filho_1", nome: "Meu Filho", imagem: "👦", fala: "Por favor, chame meu filho aqui" },
          { id: "filha_1", nome: "Minha Filha", imagem: "👧", fala: "Por favor, chame minha filha aqui" },
        ],
      },
      {
        id: "noras",
        nome: "Noras / Genros",
        icone: "👩",
        itens: [
          { id: "nora_1", nome: "Minha Nora", imagem: "👩", fala: "Por favor, chame a minha nora" },
          { id: "genro_1", nome: "Meu Genro", imagem: "👨", fala: "Por favor, chame o meu genro" },
        ],
      },
      {
        id: "pimentel",
        nome: "Família Pimentel",
        icone: "🏡",
        itens: [
          { id: "pim_1", nome: "Pimentel", imagem: "👥", fala: "Quero falar com a família Pimentel" },
        ],
      },
      {
        id: "espindola",
        nome: "Família Espindola",
        icone: "🌿",
        itens: [
          { id: "esp_1", nome: "Espindola", imagem: "👥", fala: "Quero falar com a família Espindola" },
        ],
      },
      {
        id: "outros",
        nome: "Outros Familiares e Cuidadores",
        icone: "🤝",
        itens: [
          { id: "cuidador", nome: "Cuidador(a)", imagem: "🧑‍⚕️", fala: "Por favor, chame quem está cuidando de mim" },
          { id: "medico", nome: "Médico / Fono", imagem: "🩺", fala: "Preciso falar com o médico ou com a fonoaudióloga" },
        ],
      },
    ],
  },
  {
    id: "sentimentos",
    nome: "Como está se sentindo?",
    icone: "❤️",
    cor: "#c0392b",
    tipo: "sentimentos",
    itens: [
      { id: "bem", nome: "Estou bem e feliz", imagem: "😊", fala: "Estou me sentindo muito bem e feliz hoje!" },
      { id: "calmo", nome: "Estou em paz e calmo", imagem: "😌", fala: "Estou tranquilo e em paz" },
      { id: "cansado", nome: "Estou cansado(a)", imagem: "🥱", fala: "Estou sentindo muito cansaço" },
      { id: "triste", nome: "Estou triste", imagem: "😢", fala: "Estou triste hoje, preciso de carinho" },
      { id: "chateado", nome: "Estou chateado(a)", imagem: "😠", fala: "Estou chateado e incomodado" },
      { id: "medo", nome: "Estou com medo", imagem: "😨", fala: "Estou sentindo medo ou insegurança" },
      { id: "abraco", nome: "Quero um abraço", imagem: "🫂", fala: "Eu só quero um abraço bem quentinho de vocês" },
      { id: "sozinho", nome: "Quero ficar quietinho(a)", imagem: "🤫", fala: "Quero ficar um pouco quietinho no meu canto" },
    ],
  },
  {
    id: "dor",
    nome: "Dor no corpo",
    icone: "🩺",
    cor: "#d35400",
    tipo: "dor",
  },
];

export const PARTES_CORPO = [
  { id: "cabeca", nome: "Cabeça", icone: "🤕" },
  { id: "olhos", nome: "Olhos / Rosto", icone: "👀" },
  { id: "pescoco", nome: "Pescoço / Garganta", icone: "🧣" },
  { id: "peito", nome: "Peito / Coração", icone: "🫀" },
  { id: "barriga", nome: "Barriga / Estômago", icone: "🤰" },
  { id: "costas", nome: "Costas / Coluna", icone: "🧍" },
  { id: "braco_direito", nome: "Braço Direito", icone: "💪" },
  { id: "braco_esquerdo", nome: "Braço Esquerdo", icone: "🦾" },
  { id: "perna_direita", nome: "Perna Direita", icone: "🦵" },
  { id: "perna_esquerda", nome: "Perna Esquerda", icone: "🦿" },
  { id: "pes", nome: "Pés / Tornozelo", icone: "🦶" },
];
