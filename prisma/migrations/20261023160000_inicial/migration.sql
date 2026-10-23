-- Migração inicial: tabelas já existentes no schema + pranchas

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "icone" TEXT,
    "parentId" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "imagem" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "familias" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "familias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas" (
    "id" TEXT NOT NULL,
    "familiaId" TEXT NOT NULL,
    "nomeRespondente" TEXT NOT NULL,
    "relacao" TEXT NOT NULL,
    "pessoa" TEXT,
    "papel" TEXT NOT NULL,
    "consentimento" BOOLEAN NOT NULL DEFAULT true,
    "respostas" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pranchas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "pinHash" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pranchas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "familias_token_key" ON "familias"("token");

-- CreateIndex
CREATE UNIQUE INDEX "pranchas_token_key" ON "pranchas"("token");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens" ADD CONSTRAINT "itens_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "familias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
