# Conversa Apoiada

Entrevista com famílias para desenhar um aplicativo de comunicação alternativa para pessoas que tiveram AVC. Site estático, sem etapa de build.

| Página | Para quem | O que é |
|---|---|---|
| `entrevista.html?c=CÓDIGO` | Famílias | A entrevista. Só abre com um link de convite. |
| `index.html` | Famílias | Leitura opcional: o que muda na comunicação depois do AVC, dicas para conversar, onde buscar apoio e como os dados são cuidados. |
| `convite.html` | Equipe | Gera um link de convite por família (pede o código de acesso). |
| `pesquisa.html` | Equipe | Pesquisa de base: quadros, soluções existentes, lições de design, respostas → arquitetura. |

Arquivos de apoio: `estilo.css` (visual), `config.js` (URL do script da planilha), `apps-script/Codigo.gs` (script da planilha).

## Como a entrevista funciona

- **Um link por família.** Todos os familiares usam o mesmo link, cada um no próprio aparelho.
- **Cada pessoa vira uma linha** na aba *Respostas* da planilha, com o nome da família, o nome de quem respondeu e a relação com a pessoa.
- **Duas partes:**
  - *Parte 1 · O dia a dia* (blocos A–F): fatos sobre a pessoa. Responde quem mais acompanha a rotina.
  - *Parte 2 · O seu olhar* (blocos G–I): lembranças, a relação e expectativas. Cada familiar responde.
  - Quem escolhe “convivo, mas outra pessoa acompanha mais” vê a Parte 2 primeiro e a Parte 1 como opcional.
- **Rascunho no aparelho:** as respostas ficam salvas no navegador até serem enviadas. Enviar de novo atualiza a mesma linha.
- **Consentimento** é obrigatório para enviar.
- **A família vê o que já foi respondido:** ao abrir o link, cada pergunta mostra as respostas dos outros familiares (com nome e relação) e um campo para complementar. O bloco **H · Como é para você** é privado: só aparece na planilha.

## Planilha Google

Planilha: **Conversa Apoiada — Entrevistas** (abas *Famílias* e *Respostas*, criadas pelo script).

Para instalar ou atualizar o script:

1. Na planilha: **Extensões → Apps Script**. Substitua o conteúdo por `apps-script/Codigo.gs` e salve.
2. Na primeira vez: engrenagem (**Configurações do projeto**) → **Propriedades do script** → propriedade `CODIGO` com o seu código de acesso.
3. Primeira implantação: **Implantar → Nova implantação** → **App da Web**, *Executar como:* Eu, *Quem pode acessar:* Qualquer pessoa.
   Atualizações: **Implantar → Gerenciar implantações** → lápis → *Versão:* **Nova versão** → Implantar. Assim o URL não muda.
4. O URL do app da Web fica em `config.js`.

## Privacidade

As respostas envolvem dados de saúde (dados sensíveis pela LGPD).

- Sem um código de família válido, o script não devolve nada. Com o código, devolve só as respostas daquela família, **sem o bloco H**.
- Respostas só são aceitas com um **código de convite válido**; convites só são criados com o **código de acesso**, que não fica no site.
- Mantenha a planilha **privada** (sem compartilhamento por link).
- Não faça commit de respostas exportadas: o repositório é público.

## Publicar no GitHub Pages

**Settings → Pages** → *Deploy from a branch* → `main`, pasta `/ (root)`. Endereço: https://psicologiatech.github.io/conversa-apoiada/
