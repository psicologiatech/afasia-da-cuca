# Conversa Apoiada 🧠🗣️

Aplicativo e entrevista colaborativa com famílias para desenhar soluções de comunicação alternativa para pessoas que tiveram AVC (com afasia, disartria ou apraxia de fala).

Migrado para **Next.js 14 (App Router / API Routes)**, **React**, **TypeScript**, **CSS Modules** e **Prisma ORM** para fácil deploy na **Vercel** com banco de dados **PostgreSQL** (Vercel Postgres / Neon).

---

## 🚀 Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** CSS Modules (estilos isolados por componente) + CSS Global com temas claro/escuro
- **Banco de Dados & ORM:** Prisma ORM com PostgreSQL (compatível com Vercel Postgres e Neon)
- **Hospedagem:** Vercel

---

## 📂 Estrutura do Projeto

```text
conversa-apoiada/
├── prisma/
│   └── schema.prisma           # Esquema do banco (Familias e Respostas)
├── src/
│   ├── app/                    # Rotas do Next.js 14
│   │   ├── page.tsx            # Página inicial para famílias
│   │   ├── page.module.css     # Estilos da página inicial
│   │   ├── entrevista/         # Entrevista interativa colaborativa (?c=CODIGO)
│   │   ├── convite/            # Área da equipe para gerar links de convite
│   │   ├── pesquisa/           # Pesquisa clínica e diretrizes de design
│   │   └── api/                # API Routes (Route Handlers)
│   │       ├── convite/route.ts   # Criação e consulta de convites
│   │       └── respostas/route.ts # Envio e busca com filtro LGPD do bloco H
│   ├── components/             # Componentes React modulares
│   │   ├── Header/             # Header Hero + Header.module.css
│   │   ├── Navbar/             # Menu de navegação + Navbar.module.css
│   │   ├── Card/               # Cards reutilizáveis + Card.module.css
│   │   ├── Callout/            # Destaques visuais + Callout.module.css
│   │   ├── Footer/             # Rodapé + Footer.module.css
│   │   └── ThemeToggle/        # Alternador de tema claro/escuro
│   ├── data/
│   │   └── perguntas.ts        # Dados estruturados das perguntas (Blocos A a I)
│   ├── lib/
│   │   └── prisma.ts           # Singleton do Prisma Client
│   └── styles/
│       └── globals.css         # Variáveis de cor, tipografia e tema
├── legacy/                     # Arquivos estáticos da versão anterior (referência)
└── .env.example                # Variáveis de ambiente necessárias
```

---

## 🛠️ Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/conversa_apoiada?sslmode=require"
CODIGO_ACESSO="seu_codigo_secreto"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Sincronizar o Banco de Dados
Para aplicar o esquema ao seu banco de dados:
```bash
npx prisma db push
```

### 4. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000).

---

## ☁️ Hospedagem na Vercel

1. Suba o repositório no seu GitHub.
2. Na [Vercel](https://vercel.com):
   - Importe o repositório.
   - Vá na aba **Storage** e crie um banco **Vercel Postgres** (Neon) com 1 clique.
   - Conecte o banco ao projeto (a variável `DATABASE_URL` será preenchida automaticamente).
   - Adicione a variável `CODIGO_ACESSO` nas configurações de ambiente (**Settings → Environment Variables**).
3. O deploy rodará automaticamente! O comando `npm run build` já executa `prisma generate && next build`.

---

## 🔒 Privacidade e LGPD

- **Bloco H ("Como é para você"):** Questões delicadas sobre sentimentos e sobrecarga do cuidador são estritamente privadas — a API `/api/respostas` filtra e nunca entrega essas respostas aos demais membros da família.
- **Acesso Restrito:** Apenas membros com o token do convite conseguem acessar o formulário da respectiva família.
