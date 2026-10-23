export interface Bloco {
  id: string;
  titulo: string;
  porque: string;
  privado?: boolean;
  qs: string[];
}

export interface Parte {
  id: "dia" | "olhar";
  titulo: string;
  sub: string;
  blocos: Bloco[];
}

// Estrutura das duas partes da entrevista:
// Parte 1: fatos do dia a dia (geralmente respondido por quem mais acompanha a rotina)
// Parte 2: o olhar de cada familiar (respostas individuais sobre a relação e convivência)
// O token {p} é substituído dinamicamente pelo nome informado da pessoa.
export const PARTES: Parte[] = [
  {
    id: "dia",
    titulo: "Parte 1 · O dia a dia de {p}",
    sub: "Perguntas sobre como {p} está hoje. Basta uma pessoa da família responder.",
    blocos: [
      {
        id: "A",
        titulo: "Como está agora",
        porque: "Ajuda a entender o momento da recuperação.",
        qs: [
          "Quando foi o AVC de {p}? Foi o primeiro?",
          "Qual lado do corpo foi afetado?",
          "{p} faz fonoaudiologia? A fono explicou o que aconteceu com a fala ou a linguagem? Se souber, conte o nome que ela usou.",
          "Desde o AVC, a comunicação de {p} está melhorando, igual ou piorando?"
        ]
      },
      {
        id: "B",
        titulo: "Entender o que os outros dizem",
        porque: "Mostra se o aplicativo precisa falar em voz alta, mostrar fotos ou usar palavras escritas.",
        qs: [
          "{p} entende quando vocês falam? E frases longas? E quando várias pessoas falam ao mesmo tempo?",
          "{p} consegue responder “sim” e “não” de um jeito confiável (falando, balançando a cabeça, com um gesto)? Às vezes diz “sim” querendo dizer “não”?",
          "{p} consegue ler? Palavras soltas, frases curtas, textos?",
          "{p} reconhece fotos de pessoas e objetos? E desenhos ou símbolos?"
        ]
      },
      {
        id: "C",
        titulo: "Se expressar",
        porque: "Mostra por onde a mensagem de {p} consegue sair hoje.",
        qs: [
          "{p} fala alguma coisa? O quê? (palavras soltas, frases prontas, palavras trocadas…)",
          "A fala sai, mas é difícil de entender (arrastada, fraca)? Ou a palavra simplesmente não vem?",
          "{p} consegue escrever, mesmo que pouco? Com qual mão?",
          "{p} usa gestos, aponta, desenha ou faz mímica?",
          "Hoje, como vocês descobrem o que {p} quer? Vocês criaram algum jeito próprio de se entender?"
        ]
      },
      {
        id: "D",
        titulo: "Corpo, visão e energia",
        porque: "Define o tamanho dos botões, onde ficam na tela e quanto tempo de uso é confortável.",
        qs: [
          "Qual mão {p} usa agora? Tem tremor ou dificuldade para tocar em coisas pequenas?",
          "Como está a visão? Usa óculos? Parece não perceber as coisas de um lado (esbarra, come só metade do prato)?",
          "Como está a audição?",
          "{p} cansa rápido? Em que horário costuma estar melhor?",
          "{p} passa mais tempo na cama, na cadeira ou anda pela casa?"
        ]
      },
      {
        id: "E",
        titulo: "Rotina e necessidades",
        porque: "Ajuda a decidir o que precisa estar sempre à mão no aplicativo.",
        qs: [
          "Como é um dia comum de {p}, do acordar ao dormir?",
          "O que {p} mais precisa comunicar? (dor, fome, sede, banheiro, desconforto, emoções, vontades, conversar sobre a vida…)",
          "Em que momentos a comunicação mais falha ou causa mais frustração?",
          "Com quem {p} conversa? Quem cuida em cada período do dia?",
          "{p} sai de casa? Para onde? Precisa se comunicar com pessoas desconhecidas?"
        ]
      },
      {
        id: "F",
        titulo: "Celular e tecnologia",
        porque: "Ajuda a escolher em que aparelho o aplicativo vai funcionar e quem vai cuidar dele.",
        qs: [
          "{p} usava celular antes do AVC? Para quê?",
          "Que aparelho poderia ser usado (celular Android, iPhone, tablet)? Tem internet em casa?",
          "Quem da família poderia ajudar a configurar e atualizar o aplicativo?",
          "Já tentaram alguma prancha, aplicativo ou caderno para se comunicar? O que funcionou e o que foi deixado de lado? Por quê?"
        ]
      }
    ]
  },
  {
    id: "olhar",
    titulo: "Parte 2 · O seu olhar",
    sub: "Aqui cada pessoa da família tem algo diferente para contar. Responda pensando na sua relação com {p}.",
    blocos: [
      {
        id: "G",
        titulo: "Lembranças e jeito de ser",
        porque: "Vira o vocabulário do aplicativo: nomes, assuntos e frases que são a cara de {p}.",
        qs: [
          "Quem são as pessoas importantes para {p}? Nomes e apelidos.",
          "Do que {p} gosta? Comidas, músicas, programas, time, fé, assuntos preferidos.",
          "Qual era o trabalho de {p}? Do que tinha orgulho?",
          "{p} tem expressões típicas, um jeito próprio de brincar? Conte algumas.",
          "Sobre o que você acha que {p} gostaria de conversar e hoje não consegue?"
        ]
      },
      {
        id: "H",
        privado: true,
        titulo: "Como é para você",
        porque: "Ajuda a pensar como o aplicativo pode apoiar também quem conversa com {p}.",
        qs: [
          "Quando {p} não consegue se fazer entender com você, como reage?",
          "{p} aceita ajuda? Parece sentir vergonha de usar recursos na frente dos outros?",
          "Como você vê o humor de {p} de modo geral?",
          "E você, como está lidando com tudo isso?"
        ]
      },
      {
        id: "I",
        titulo: "O que você espera",
        porque: "Mostra o que o aplicativo precisa resolver primeiro.",
        qs: [
          "Se o aplicativo desse certo, o que mudaria na vida de {p} e na sua? Como seria um “deu certo”?",
          "Quer contar mais alguma coisa?"
        ]
      }
    ]
  }
];

// Função auxiliar para substituir {p} pelo nome fornecido
export function formatarTexto(texto: string, nomePessoa?: string): string {
  const nome = (nomePessoa || "").trim() || "a pessoa";
  return texto
    .replace(/^\{p\}/, nome.charAt(0).toUpperCase() + nome.slice(1))
    .replace(/\{p\}/g, nome);
}
