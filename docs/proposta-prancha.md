# Proposta: prancha por fotos (`/prancha`) 🖼️

Esta proposta adiciona uma nova tela, `/prancha`, **ao lado** da tela inicial atual (`/`), sem alterá-la, para que a equipe compare as duas no tablet.

As decisões vêm da entrevista com a família (resumo sem dados identificáveis abaixo) e da literatura sobre Comunicação Alternativa na afasia.

---

## O que a entrevista mostrou

| Achado | Consequência para o app |
|---|---|
| Aponta muito — é o canal de comunicação mais usado | Tocar numa foto é a forma principal de escolher |
| Reconhece fotos na maioria das vezes; lê mal | Fotos reais, texto só como legenda, e voz em todo toque |
| **Sim e não não são confiáveis** | Botão fixo **“Não é isso”**; o app não depende do sim/não |
| O método atual (falar uma lista e esperar sim/não) falha várias vezes seguidas e gera frustração | Mostrar todas as opções de uma vez, para ela apontar |
| Mão não dominante, sem coordenação; enxerga mal de perto | No máximo 8 botões por tela (4 no modo simples), enormes, sem gestos de arrastar ou segurar |
| Fadiga intensa | Tudo a no máximo um toque da tela inicial |
| Fica na cama; acorda à noite | Tablet ao lado da cama, tela acesa, tema que escurece à noite, botão de chamar com som |
| Dias “piores” | Modo simples com 4 botões |
| Será incentivada a treinar a escrita | O **Teclado Grande** existente continua disponível pelo botão “Escrever” |

---

## O que a tela faz

- **Tela inicial em grade**, sem rolagem: Beber, Comer, Dor, Me ajeitar, Como estou, Pessoas, Descansar, Chamar alguém.
- **Barra fixa:** Escrever / Início · **Não é isso** · Sim · Não · ⚙.
- **Uma camada só:** cada categoria abre direto os itens. Acima de 8 itens, aparece o botão “Mais”.
- **Ao tocar:** fala a frase (Web Speech API, `pt-BR`) e mostra a escolha em tamanho grande por alguns segundos, para quem está perto ver.
- **Dor:** escolha do lugar e depois da intensidade com três rostos (pouco, mais ou menos, muito), no lugar da escala de 0 a 10, que é difícil com afasia.
- **Pessoas:** tocar na foto fala o nome e oferece “Chamar aqui”, “Como está?” e “Quero ver”.
- **Chamar alguém:** som alto repetido e tela piscando até alguém tocar em “Já vim”.
- **Toques repetidos** em menos de 0,7 s são ignorados (tremor, toque duplo sem querer).
- **Tela acesa** com Wake Lock enquanto a prancha está aberta.

### Modo família

- Abre segurando a ⚙ por 1,5 s, para a pessoa não abrir sem querer.
- Tocar num item edita a foto, o nome, a frase e o “esconder da tela”.
- **Adicionar** abre a câmera (`<input type="file" capture>`): a família tira a foto na hora, e a imagem é cortada em quadrado e reduzida para 640 px.
- **Configurações:** frases no feminino ou no masculino (`{a}` nos textos), modo simples, tema (automático 20h–7h, claro ou escuro), velocidade da voz e cópia de segurança (exportar e restaurar JSON).
- As confirmações ficam na própria tela (sem `confirm()`), o que funciona melhor em tablet.

---

## Onde ficam os dados

**Tudo fica no próprio aparelho, em IndexedDB** (`conversa-apoiada-prancha`). Fotos e nomes da família **não vão para o servidor nem para o repositório**, que é público.

O conteúdo inicial (`src/components/Prancha/conteudoInicial.ts`) é genérico de propósito. Antes do uso, conferir comidas e bebidas com a fonoaudióloga, por causa da segurança para engolir.

Uma sincronização com o banco (Prisma) pode vir depois, por exemplo para a família mandar fotos do próprio celular. Isso exige armazenamento privado das imagens e autenticação.

---

## Arquivos

```text
src/app/prancha/page.tsx                  # rota /prancha
src/components/Prancha/Prancha.tsx        # tela, modo família, editor e configurações
src/components/Prancha/Prancha.module.css # estilos (usa os tokens de globals.css)
src/components/Prancha/conteudoInicial.ts # categorias, itens e partes do corpo
src/components/Prancha/apoio.ts           # IndexedDB, foto, voz, som de chamar
src/components/Prancha/tipos.ts           # tipos
src/lib/autorizacao.ts                    # checagem do CODIGO_ACESSO
```

## Mudança em arquivos existentes

`src/app/api/db/itens/route.ts` e `src/app/api/db/categorias/route.ts`: **POST e DELETE passam a exigir o cabeçalho `x-codigo-acesso`** com o valor de `CODIGO_ACESSO`. Sem isso, qualquer pessoa com o endereço publicado poderia criar ou apagar itens. Nenhuma tela atual chama essas rotas, então nada muda no uso.

O `GET /api/db/categorias` continua aberto. Se o banco passar a guardar nomes ou fotos da família, vale proteger também.

---

## Como testar

```bash
git fetch origin
git checkout proposta/prancha-por-fotos
npm install
npm run dev
# abrir http://localhost:3000/prancha (de preferência no tablet, deitado)
```

A tela `/prancha` não usa o banco. Ela roda mesmo sem `DATABASE_URL`.
