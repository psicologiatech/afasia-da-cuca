# Comunicação após o AVC

Pesquisa de base e roteiro de entrevista com a família para desenhar um app de comunicação alternativa pós-AVC.

Página única, sem dependências de build: tudo está em `index.html`.

## Publicar no GitHub Pages

1. Crie um repositório e envie o `index.html` (e este README) para a branch `main`.
2. No repositório: **Settings → Pages → Build and deployment**.
3. Em *Source*, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Em alguns minutos a página fica disponível em https://psicologiatech.github.io/conversa-apoiada/.

## Privacidade do roteiro

As respostas digitadas no roteiro ficam salvas **apenas no navegador** de quem preencheu (localStorage). Nada é enviado ao GitHub nem a qualquer servidor.

- **Exportar (.md):** gera um arquivo legível com todas as respostas.
- **Exportar dados (.json):** guarda as respostas para continuar depois, em outro aparelho.
- **Importar .json:** retoma um preenchimento salvo.

Não faça commit de arquivos exportados com respostas de famílias: o repositório público expõe esses dados.
