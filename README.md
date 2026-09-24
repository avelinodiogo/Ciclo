# Ciclo de estudos — GitHub Pages

## Publicar

1. Crie um repositório no GitHub.
2. Envie `index.html` e `app.js` para a raiz da branch `main`. O `README.md` é opcional.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **Deploy from a branch**. Selecione `main` e `/ (root)` e salve.
5. Aguarde a URL do GitHub Pages aparecer nessa mesma página.

Não há dependências, instalação ou etapa de compilação. O `index.html` usa o caminho relativo `app.js`, então também funciona em URLs do tipo `usuario.github.io/nome-do-repositorio/`.

## Dados

As matérias e configurações são salvas pelo navegador em `localStorage`. Elas não acompanham estes arquivos, não são sincronizadas entre dispositivos e não aparecem automaticamente no endereço do GitHub Pages. O site novo iniciará com as matérias padrão, mesmo que você tenha personalizado a versão anterior. Evite limpar os dados do navegador antes de copiar manualmente suas configurações.

A página do GitHub Pages fica pública na internet, inclusive quando o repositório de origem é privado em planos que permitem essa configuração. Não inclua dados pessoais sensíveis no código.
