# Comunicação após o AVC

Pesquisa de base e roteiro de entrevista com a família para desenhar um app de comunicação alternativa pós-AVC.

Site estático, sem etapa de build:

- `index.html` — a pesquisa (o que o AVC causa, o que existe, lições de design, respostas → arquitetura)
- `roteiro.html` — o roteiro de entrevista preenchível
- `estilo.css` — visual compartilhado pelas duas páginas
- `apps-script/Codigo.gs` — script que grava as entrevistas numa planilha Google

## Publicar no GitHub Pages

1. No repositório: **Settings → Pages → Build and deployment**.
2. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em alguns minutos a página fica disponível em https://psicologiatech.github.io/conversa-apoiada/.

## Ligar o roteiro à planilha Google

As entrevistas vão para a planilha **Conversa Apoiada — Entrevistas**, no Google Drive da dona do projeto. Configuração, uma vez só:

1. Abra a planilha → **Extensões → Apps Script**. Apague o que houver e cole o conteúdo de `apps-script/Codigo.gs`. Salve.
2. Clique na engrenagem (**Configurações do projeto**) → **Propriedades do script** → **Adicionar propriedade**: nome `CODIGO`, valor = um código de acesso só seu. Salve.
3. **Implantar → Nova implantação** → tipo **App da Web**. *Executar como:* Eu. *Quem pode acessar:* Qualquer pessoa. Implante e autorize o acesso à sua conta.
4. Copie o **URL do app da Web** (termina em `/exec`).
5. No `roteiro.html`, abra **Conexão com a planilha**, cole o URL e o código, e clique em **Salvar conexão**. Isso é feito uma vez em cada aparelho usado nas entrevistas.

Se mudar o script depois, use **Implantar → Gerenciar implantações → editar → Nova versão**, para manter o mesmo URL.

## Privacidade

As respostas envolvem dados de saúde (dados sensíveis pela LGPD). Por isso:

- **O URL do script e o código não ficam no site.** Eles são digitados em cada aparelho e guardados só nele.
- **O script só grava; nunca devolve dados.** Quem descobrir o URL não consegue ler a planilha, e sem o código não consegue gravar.
- **Até ser enviada, a entrevista existe só no navegador** de quem preencheu. Enviar de novo atualiza a mesma linha da planilha.
- **Mantenha a planilha privada.** Não compartilhe por link aberto.
- **Peça consentimento** à família antes de registrar, explicando para que as respostas serão usadas.
- **Não faça commit** de arquivos exportados (.md/.json) com respostas: o repositório é público.
