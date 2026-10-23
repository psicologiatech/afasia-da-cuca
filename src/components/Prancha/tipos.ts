// Modelo de dados da prancha por fotos.
// Tudo fica guardado no próprio aparelho (IndexedDB): fotos da família não vão para servidor.

export type TipoTela = "itens" | "dor" | "chamar" | "pessoas";

export interface ItemPrancha {
  id: string;
  rotulo: string; // texto curto no botão (pode ter {a} para gênero)
  fala: string; // frase dita em voz alta (pode ter {a})
  emoji?: string; // usado enquanto não houver foto
  foto?: string; // data URL (JPEG reduzido): cópia da foto guardada no aparelho
  fotoBlob?: string; // caminho da foto no Vercel Blob privado (quando a prancha está ligada à nuvem)
  oculto?: boolean; // escondido da tela, mas não apagado
  personalizado?: boolean; // criado pela família (pode ser excluído)
  ehGrupo?: boolean; // em Pessoas: um grupo (ex.: "Noras") que abre as pessoas dele
  grupo?: string; // em Pessoas: id do grupo a que a pessoa pertence
  telefone?: string; // em Pessoas: número para "Ligar para…" (só dígitos, com DDD)
}

export interface TelaPrancha {
  id: string;
  rotulo: string;
  emoji: string;
  cor: string;
  fala: string; // dito ao abrir a tela
  tipo: TipoTela;
  itens: ItemPrancha[];
  simples?: boolean; // aparece também no modo simples
}

export type Genero = "a" | "o";
export type Tema = "auto" | "claro" | "noturno";

export interface ConfigPrancha {
  genero: Genero;
  modoSimples: boolean;
  tema: Tema;
  velocidadeVoz: number; // 0.6 a 1.2
}

export interface DadosPrancha {
  versao: 1;
  telas: TelaPrancha[];
  config: ConfigPrancha;
}
