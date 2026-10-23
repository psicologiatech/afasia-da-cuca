# Modelagem do Banco de Dados 🗄️

O banco de dados utiliza o **Prisma ORM** com **PostgreSQL**, projetado para rodar perfeitamente no **Vercel Postgres (Neon)** ou em qualquer instância PostgreSQL.

---

## 📐 Esquema de Dados (`prisma/schema.prisma`)

### 1. Tabela `categorias`
Armazena tanto as categorias principais (ex: *Comida*, *Bebida*, *Pessoas*) quanto as subcategorias (ex: *Doce*, *Salgada*, *Filhos*, *Noras*), utilizando uma autorrelação (`parentId`).

```prisma
model Categoria {
  id        String       @id @default(uuid())
  nome      String
  icone     String?      // Emoji ou ícone representativo (ex: 🍲, 👥)
  parentId  String?      // Se preenchido, é uma subcategoria da categoria pai
  parent    Categoria?   @relation("Subcategorias", fields: [parentId], references: [id], onDelete: Cascade)
  subs      Categoria[]  @relation("Subcategorias")
  itens     Item[]
  ordem     Int          @default(0)
  criadoEm  DateTime     @default(now())

  @@map("categorias")
}
```

---

### 2. Tabela `itens` (Tabela Simples do App)
Contém os elementos individuais que o idoso toca para falar:

```prisma
model Item {
  id          String    @id @default(uuid())
  nome        String    // Ex: "Sopa", "Pudim", "Água fresca", "Meu Filho João"
  imagem      String    // Emoji ou URL da foto da pessoa/comida
  categoriaId String
  categoria   Categoria @relation(fields: [categoriaId], references: [id], onDelete: Cascade)
  ordem       Int       @default(0)
  criadoEm    DateTime  @default(now())

  @@map("itens")
}
```

---

### 3. Tabelas de Apoio à Entrevista Familiar (`familias` e `respostas`)
Mantêm o histórico da pesquisa clínica inicial realizada com as famílias:

```prisma
model Familia {
  id        String     @id @default(uuid())
  token     String     @unique // Código de convite compartilhado com a família
  nome      String     // Ex: "Família da Dona Maria"
  criadoEm  DateTime   @default(now())
  respostas Resposta[]

  @@map("familias")
}

model Resposta {
  id               String   @id // ID do dispositivo/familiar
  familiaId        String
  familia          Familia  @relation(fields: [familiaId], references: [id], onDelete: Cascade)
  nomeRespondente  String
  relacao          String   // Filha, esposo, neto...
  pessoa           String?  // Nome da pessoa com AVC
  papel            String   // "principal" ou "complementar"
  consentimento    Boolean  @default(true)
  respostas        Json     // Dicionário de respostas das perguntas
  criadoEm         DateTime @default(now())
  atualizadoEm     DateTime @updatedAt

  @@map("respostas")
}
```

---

## ☁️ Como Conectar o Banco na Vercel

1. No dashboard do seu projeto na [Vercel](https://vercel.com):
2. Clique na aba **Storage** → **Create Database** → selecione **Postgres (Neon)**.
3. Clique em **Connect to Project** e escolha o repositório `afasia-da-cuca`.
4. A Vercel criará automaticamente a variável `DATABASE_URL` no seu ambiente.
5. Para sincronizar as tabelas no banco da Vercel pela primeira vez:
   ```bash
   npx prisma db push
   ```
6. A cada deploy, o comando de build configurado no `package.json` (`prisma generate && next build`) compila as tipagens automaticamente.
