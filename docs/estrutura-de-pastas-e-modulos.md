# Estrutura de Pastas e Módulos 📂

A estrutura do projeto segue o padrão modular do **Next.js 14 com App Router**, separando responsabilidades de roteamento, componentes, estilização, dados e modelos de banco.

```text
conversa-apoiada/
├── docs/                               # 📖 Documentação técnica do projeto
│   ├── arquitetura-e-tecnologias.md
│   ├── estrutura-de-pastas-e-modulos.md
│   ├── banco-de-dados.md
│   └── guia-de-desenvolvimento.md
│
├── prisma/                             # 🗄️ Esquema do Banco de Dados
│   └── schema.prisma                   # Modelos Categoria, Item, Familia e Resposta
│
├── src/
│   ├── app/                            # 🌐 Rotas e Páginas (Next.js App Router)
│   │   ├── page.tsx                    # Home principal: App de Comunicação
│   │   ├── layout.tsx                  # Layout raiz com fontes e estilos globais
│   │   ├── gerenciar/                  # ⚙️ Tela de Gerenciamento do DB (/gerenciar)
│   │   │   ├── page.tsx
│   │   │   └── gerenciar.module.css
│   │   ├── entrevista/                 # 📋 Entrevista familiar colaborativa (/entrevista)
│   │   │   ├── page.tsx
│   │   │   ├── EntrevistaForm.tsx
│   │   │   └── entrevista.module.css
│   │   ├── convite/                    # 🔑 Área da equipe para criar links (/convite)
│   │   │   ├── page.tsx
│   │   │   └── convite.module.css
│   │   ├── pesquisa/                   # 🔬 Documentação clínica e de design (/pesquisa)
│   │   │   ├── page.tsx
│   │   │   └── pesquisa.module.css
│   │   └── api/                        # ⚡ API Routes (Route Handlers)
│   │       ├── db/
│   │       │   ├── categorias/route.ts # CRUD de categorias e subcategorias
│   │       │   └── itens/route.ts      # Adição e remoção de itens
│   │       ├── convite/route.ts        # Criação de tokens de família
│   │       └── respostas/route.ts      # Busca/gravação com filtro LGPD do bloco H
│   │
│   ├── components/                     # 🧩 Componentes React com CSS Modules
│   │   ├── HomeApp/                    # Componente mestre da Home
│   │   │   ├── HomeApp.tsx
│   │   │   └── HomeApp.module.css
│   │   ├── TecladoGrande/              # Teclado acessível em modal
│   │   │   ├── TecladoGrande.tsx
│   │   │   └── TecladoGrande.module.css
│   │   ├── PranchaComunicao/           # Prancha auxiliar de categorias
│   │   ├── Header/                     # Topo hero
│   │   ├── Navbar/                     # Menu de navegação
│   │   ├── Card/                       # Cards reutilizáveis
│   │   ├── Callout/                    # Avisos e destaques
│   │   ├── Footer/                     # Rodapé
│   │   └── ThemeToggle/                # Alternador de tema claro/escuro
│   │
│   ├── data/                           # 📊 Dados e Estruturas Iniciais
│   │   ├── dadosIniciais.ts            # Tópicos (Comida, Bebida, Pessoas, Dor 0 a 10)
│   │   └── perguntas.ts                # Blocos A a I da pesquisa familiar
│   │
│   ├── lib/
│   │   └── prisma.ts                   # Singleton do cliente Prisma
│   │
│   └── styles/
│       └── globals.css                 # Variáveis CSS, cores, tipografia e reset
│
├── entrevista/                         # 🗃️ Arquivos estáticos da versão inicial (legado)
├── .env.example                        # Modelo de variáveis de ambiente
├── package.json                        # Scripts e dependências
└── tsconfig.json                       # Configurações do compilador TypeScript
```

---

## 🔄 Fluxo de Navegação do Usuário na Home

```text
[ Tela Inicial ]
   ├── Botão: ⌨️ TECLADO GRANDE ---> Abre Modal com teclas gigantes + Síntese de Voz
   ├── Botão: ⚙️ BANCO DB ----------> Abre Tela de Gerenciamento do Banco (/gerenciar)
   ├── Botões Rápidos: 👍 SIM / 👎 NÃO -> Fala em voz alta instantânea
   │
   └── Tópicos Favoritos:
         ├── 🍲 Comida -------------> Subcategorias (Doce / Salgada) -> Lista de Itens (Fala)
         ├── 🥤 Bebida -------------> Lista Direta de Itens (Fala)
         ├── 👥 Pessoas ------------> Subcategorias (Filhos, Noras, Pimentel, Espindola, Outros) -> Fala
         ├── ❤️ Sentimentos --------> Carinhas e Estados Emocionais (Fala)
         └── 🩺 Dor no Corpo -------> Passo 1 (Qual parte?) -> Passo 2 (Escala 0 a 10) -> Fala
```
