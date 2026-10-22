# Comunicação após o AVC

Pesquisa de base e roteiro de entrevista com a família para desenhar um app de comunicação alternativa pós-AVC.

Site estático, sem etapa de build:

- `index.html` — a pesquisa (o que o AVC causa, o que existe, lições de design, respostas → arquitetura)
- `roteiro.html` — o roteiro de entrevista preenchível
- `estilo.css` — visual compartilhado pelas duas páginas

## Publicar no GitHub Pages

1. No repositório: **Settings → Pages → Build and deployment**.
2. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
3. Em alguns minutos a página fica disponível em https://psicologiatech.github.io/conversa-apoiada/.

## Privacidade do roteiro

As respostas digitadas no roteiro ficam salvas **apenas no navegador** de quem preencheu (localStorage). Nada é enviado ao GitHub nem a qualquer servidor.

- **Exportar (.md):** gera um arquivo legível com todas as respostas.
- **Exportar dados (.json):** guarda as respostas para continuar depois, em outro aparelho.
- **Importar .json:** retoma um preenchimento salvo.

Não faça commit de arquivos exportados com respostas de famílias: o repositório público expõe esses dados.
