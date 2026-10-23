import { DadosPrancha, Genero } from "./tipos";

// Conteúdo de partida. É genérico de propósito: o repositório é público,
// então nomes e fotos da família são adicionados no próprio aparelho, pelo modo família.
// "{a}" vira "a" ou "o" conforme o gênero escolhido nas configurações.
// Antes de usar, confira comidas e bebidas com a fonoaudióloga (consistência segura para engolir).

export const CONTEUDO_INICIAL: DadosPrancha = {
  versao: 1,
  config: { genero: "a", modoSimples: false, tema: "auto", velocidadeVoz: 0.85 },
  telas: [
    {
      id: "beber", rotulo: "Beber", emoji: "🥤", cor: "#1f6f62", fala: "Quero beber.", tipo: "itens", simples: true,
      itens: [
        { id: "agua", rotulo: "Água", emoji: "💧", fala: "Quero água." },
        { id: "leite", rotulo: "Leite", emoji: "🥛", fala: "Quero leite." },
        { id: "cafe", rotulo: "Café", emoji: "☕", fala: "Quero café." },
        { id: "suco", rotulo: "Suco", emoji: "🧃", fala: "Quero suco." },
        { id: "cha", rotulo: "Chá", emoji: "🍵", fala: "Quero chá." },
      ],
    },
    {
      id: "comer", rotulo: "Comer", emoji: "🍽️", cor: "#b5552b", fala: "Quero comer.", tipo: "itens", simples: true,
      itens: [
        { id: "fome", rotulo: "Estou com fome", emoji: "🍽️", fala: "Estou com fome." },
        { id: "fruta", rotulo: "Fruta", emoji: "🍌", fala: "Quero fruta." },
        { id: "pao", rotulo: "Pão", emoji: "🍞", fala: "Quero pão." },
        { id: "sopa", rotulo: "Sopa", emoji: "🥣", fala: "Quero sopa." },
        { id: "doce", rotulo: "Doce", emoji: "🍮", fala: "Quero um doce." },
        { id: "satisfeita", rotulo: "Já comi", emoji: "✋", fala: "Já estou satisfeit{a}." },
      ],
    },
    {
      id: "dor", rotulo: "Dor", emoji: "🤕", cor: "#c0392b", fala: "Estou com dor.", tipo: "dor", simples: true, itens: [],
    },
    {
      id: "ajeitar", rotulo: "Me ajeitar", emoji: "🛏️", cor: "#6c5b7b", fala: "Preciso de ajuda para me ajeitar.", tipo: "itens",
      itens: [
        { id: "posicao", rotulo: "Mudar de posição", emoji: "🔄", fala: "Quero mudar de posição." },
        { id: "trocar", rotulo: "Me trocar", emoji: "🧻", fala: "Preciso ser trocad{a}." },
        { id: "travesseiro", rotulo: "Travesseiro", emoji: "🛌", fala: "Arruma meu travesseiro, por favor." },
        { id: "frio", rotulo: "Está frio", emoji: "🥶", fala: "Estou com frio." },
        { id: "calor", rotulo: "Está calor", emoji: "🥵", fala: "Estou com calor." },
        { id: "coceira", rotulo: "Coceira", emoji: "🖐️", fala: "Está coçando." },
      ],
    },
    {
      id: "sentir", rotulo: "Como estou", emoji: "❤️", cor: "#a87a12", fala: "Quero dizer como estou.", tipo: "itens",
      itens: [
        { id: "bem", rotulo: "Bem", emoji: "🙂", fala: "Estou bem." },
        { id: "cansada", rotulo: "Cansad{a}", emoji: "😩", fala: "Estou cansad{a}." },
        { id: "triste", rotulo: "Triste", emoji: "😢", fala: "Estou triste." },
        { id: "irritada", rotulo: "Irritad{a}", emoji: "😠", fala: "Estou irritad{a}." },
        { id: "medo", rotulo: "Com medo", emoji: "😨", fala: "Estou com medo." },
        { id: "teamo", rotulo: "Te amo", emoji: "❤️", fala: "Eu te amo." },
        { id: "obrigada", rotulo: "Obrigad{a}", emoji: "🙏", fala: "Obrigad{a}." },
      ],
    },
    {
      id: "pessoas", rotulo: "Pessoas", emoji: "👨‍👩‍👧", cor: "#3b5998", fala: "Quero falar de alguém.", tipo: "pessoas", itens: [],
    },
    {
      id: "descansar", rotulo: "Descansar", emoji: "😴", cor: "#41607a", fala: "Quero descansar.", tipo: "itens",
      itens: [
        { id: "dormir", rotulo: "Quero dormir", emoji: "😴", fala: "Quero dormir." },
        { id: "agoranao", rotulo: "Agora não", emoji: "✋", fala: "Agora não." },
        { id: "quieta", rotulo: "Ficar quietinh{a}", emoji: "🤫", fala: "Quero ficar quietinh{a} um pouco." },
        { id: "tv", rotulo: "Televisão", emoji: "📺", fala: "Liga ou desliga a televisão, por favor." },
        { id: "luz", rotulo: "Luz", emoji: "💡", fala: "Acende ou apaga a luz, por favor." },
      ],
    },
    {
      id: "chamar", rotulo: "Chamar alguém", emoji: "🔔", cor: "#d35400", fala: "Preciso de ajuda. Alguém pode vir aqui?", tipo: "chamar", simples: true, itens: [],
    },
  ],
};

export const PARTES_DOR = [
  { id: "cabeca", rotulo: "Cabeça", emoji: "🤕" },
  { id: "garganta", rotulo: "Garganta", emoji: "😮" },
  { id: "peito", rotulo: "Peito", emoji: "🫀" },
  { id: "barriga", rotulo: "Barriga", emoji: "🤢" },
  { id: "costas", rotulo: "Costas", emoji: "🧍" },
  { id: "braco", rotulo: "Braço", emoji: "💪" },
  { id: "perna", rotulo: "Perna", emoji: "🦵" },
  { id: "outro", rotulo: "Outro lugar", emoji: "❓" },
];

export const INTENSIDADE_DOR = [
  { id: "pouco", rotulo: "Pouco", emoji: "😕", fala: "Dói pouco.", cor: "#e3b84f" },
  { id: "medio", rotulo: "Mais ou menos", emoji: "😣", fala: "Dói mais ou menos.", cor: "#e67e22" },
  { id: "muito", rotulo: "Muito", emoji: "😭", fala: "Dói muito!", cor: "#c0392b" },
];

export function comGenero(texto: string, genero: Genero): string {
  return texto.replace(/\{a\}/g, genero);
}
