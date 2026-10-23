# Conversa Apoiada

Aplicativo de **Comunicação Alternativa** para uma pessoa com **afasia após um AVC**, feito em família e desenhado a partir de uma entrevista com quem convive com ela.

A ideia central: em vez de falar uma lista de opções e esperar um “sim” ou “não” (que, na afasia, nem sempre são confiáveis), **mostrar todas as opções de uma vez, em fotos, para a pessoa apontar**. O app fala a escolha em voz alta.

> Projeto da PsicologiaTech. Material de apoio: não substitui avaliação fonoaudiológica ou médica.

---

## O que existe hoje

| Rota | Para quem | O que faz |
|---|---|---|
| **`/prancha`** | A pessoa com afasia (tablet ao lado da cama) | Prancha por fotos: 8 botões numa tela só, “Não é isso” fixo, dor em dois passos, chamar alguém com som, teclado para treinar a escrita e **modo família** para tirar fotos na hora. Detalhes em [`docs/proposta-prancha.md`](docs/proposta-prancha.md). |
| `/` | — | Primeira versão da tela inicial (categorias com subcategorias, Sim/Não, dor de 0 a 10, Teclado Grande). |
| `/gerenciar` | Equipe | Editar categorias e itens da tela inicial. |
| `/entrevista?c=CÓDIGO` | Famílias | Entrevista colaborativa: cada familiar responde, e o bloco “Como é para você” fica privado. |
| `/convite` | Equipe | Gera os links de convite da entrevista. |
| `/pesquisa` | Equipe | Pesquisa de base: afasia, disartria, apraxia, soluções existentes e lições de design. |

A pasta [`entrevista/`](entrevista/) guarda a **primeira versão** da entrevista, em páginas estáticas que gravam numa planilha Google ([`apps-script/Codigo.gs`](apps-script/Codigo.gs)). Ela ficou como referência: com o site na Vercel, essas páginas não são mais publicadas.

---

## Tecnologias

- **Next.js 14** (App Router), **React 18**, **TypeScript**, **CSS Modules**
- **Prisma ORM** com **PostgreSQL no Neon**
- **Vercel Blob privado** para as fotos (planejado; veja abaixo)
- **Web Speech API** (`pt-BR`) para a voz, sem serviço pago
- Hospedagem na **Vercel**

## Infraestrutura

| Peça | Situação | Observação |
|---|---|---|
| Projeto na Vercel | ✅ Criado e ligado ao repositório | Cada push na `main` publica; cada pull request ganha um link de prévia. |
| Banco **Neon** | A conectar | Criar pela aba **Storage** da Vercel. Escolher a região de São Paulo, se estiver disponível, para os dados ficarem no Brasil (LGPD). |
| **Blob privado** | A conectar | Criar pela aba **Storage** com acesso **Private**. Fotos privadas só são lidas com autenticação, por uma rota do próprio app. |
| GitHub Pages | Desativado | Substituído pela Vercel. |

### Variáveis de ambiente

| Variável | De onde vem |
|---|---|
| `DATABASE_URL` | Preenchida pela Vercel ao conectar o Neon |
| `BLOB_READ_WRITE_TOKEN` / OIDC | Preenchidas pela Vercel ao conectar o Blob |
| `CODIGO_ACESSO` | **Definir à mão** em *Settings → Environment Variables*. É o código da equipe para gerar convites e alterar itens. |
| `NEXT_PUBLIC_APP_URL` | Endereço público do site (ex.: `https://<projeto>.vercel.app`) |

Modelo em [`.env.example`](.env.example). **Nunca faça commit do `.env`.**

---

## Rodar na sua máquina

```bash
npm install          # instala e gera o Prisma Client
cp .env.example .env # preencha DATABASE_URL e CODIGO_ACESSO
npx prisma db push   # cria as tabelas no banco (primeira vez)
npm run dev          # http://localhost:3000
```

A rota **`/prancha` funciona sem banco**: ela guarda tudo no próprio aparelho, então dá para testá-la logo depois do `npm install`.

Para ver em tamanho real, abra no tablet, deitado, pela rede local: `npm run dev -- -H 0.0.0.0` e acesse `http://<ip-do-computador>:3000/prancha`.

---

## Como trabalhamos

- **Ninguém envia direto para a `main`.** Cada mudança vai numa branch própria (`proposta/…`, `docs/…`, `correcao/…`) e entra por **pull request**, revisado pela outra pessoa da equipe.
- A Vercel gera um **link de prévia** para cada pull request: teste ali, de preferência no tablet.
- Mensagens de commit em português, dizendo o que mudou e por quê.
- Decisões de design partem do que a família contou e do que a fonoaudióloga orientar. Quando não houver certeza, testar com a pessoa antes de construir.

---

## Privacidade e LGPD

O app lida com **dados de saúde** de uma pessoa e com fotos e nomes da família.

- **Este repositório é público.** Não coloque aqui nomes, fotos, respostas da entrevista, telefones nem detalhes de saúde. O conteúdo inicial da prancha é genérico de propósito.
- **Fotos ficam privadas.** Hoje ficam só no tablet (IndexedDB). Com o Blob, ficarão num armazenamento privado, servidas só para quem tem acesso à prancha da família.
- **Bloco “Como é para você” da entrevista:** só a equipe lê. A API não entrega essas respostas aos familiares.
- **Rotas que alteram dados** (`/api/db/*`, `/api/convite`) exigem o `CODIGO_ACESSO`.
- A entrevista só é enviada com **consentimento** de quem responde.

---

## Próximos passos

1. Conectar o Neon e o Blob privado na Vercel.
2. Ligar a `/prancha` ao banco e ao Blob, mantendo a cópia no aparelho para funcionar sem internet.
3. Acesso da prancha por link da família (só leitura) e PIN para o modo família.
4. Teste com a pessoa e com os cuidadores, e revisão dos itens de comida e bebida com a fonoaudióloga.
5. Decidir se a `/prancha` passa a ser a tela inicial.

---

## Documentação

- [Arquitetura e tecnologias](docs/arquitetura-e-tecnologias.md)
- [Estrutura de pastas e módulos](docs/estrutura-de-pastas-e-modulos.md)
- [Banco de dados](docs/banco-de-dados.md)
- [Guia de desenvolvimento](docs/guia-de-desenvolvimento.md)
- [Proposta da prancha por fotos](docs/proposta-prancha.md)

## Equipe

Karolyne Silva Alves (psicóloga, CRP 12/12179) e Caio Espindola.
