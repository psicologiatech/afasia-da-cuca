# Guia de Desenvolvimento e Comandos Úteis 🚀

Este guia reúne as instruções práticas para executar, testar e versionar o projeto **Conversa Apoiada / Afasia da Cuca**.

---

## 💻 Executar o Projeto Localmente

1. **Instalar dependências (caso seja a primeira vez ou em nova máquina):**
   ```bash
   npm install
   ```

2. **Gerar os tipos do Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Executar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse no navegador: **[http://localhost:3000](http://localhost:3000)**.

4. **Testar compilação de produção (build):**
   ```bash
   npm run build
   ```

---

## 🔑 Autenticação Git e Fluxo SSH

O repositório está configurado para utilizar o seu alias SSH pessoal (`github-pessoal`), apontando para a sua chave `~/.ssh/id_github_pessoal`.

### Comandos Git do dia a dia:

```bash
# 1. Conferir o status das alterações
git status

# 2. Adicionar arquivos alterados
git add .

# 3. Criar commit descritivo
git commit -m "feat: sua mensagem de alteração"

# 4. Enviar para o GitHub via SSH (usando o perfil github-pessoal)
git push origin main
```

---

## 🌐 URLs e Páginas da Aplicação

| Rota | Descrição |
|---|---|
| **`/`** | **Home principal:** Tópicos favoritos, botões Sim/Não, Dor 0 a 10 e Teclado Grande. |
| **`/gerenciar`** | **Gerenciamento do DB:** Criar categorias, subcategorias, adicionar e remover itens. |
| **`/entrevista`** | **Entrevista familiar:** Questionário colaborativo para as famílias responderem. |
| **`/convite`** | **Área da equipe:** Gerador de links personalizados e compartilhamento no WhatsApp. |
| **`/pesquisa`** | **Pesquisa científica:** Documentação dos quadros clínicos (afasia, disartria, apraxia). |
