# Gestão Financeira — Demonstração de portfólio

Esta versão é estática: não precisa de backend, SQLite ou variáveis de ambiente. Os exemplos são fictícios; cada visitante tem seus próprios dados no navegador. O login apenas simula os perfis e não protege dados confidenciais.

## Publicação

1. Extraia gestao-financeira-portfolio-vercel.zip e envie seu conteúdo para um repositório novo no GitHub.
2. Na Vercel, escolha Add New → Project e importe o repositório.
3. Use Framework Preset: Other e Root Directory: raiz do repositório.
4. O vercel.json define Output Directory: frontend. Não há comando de build ou instalação necessário.
5. Clique em Deploy. Use o endereço público gerado, terminado em .vercel.app, na postagem do LinkedIn.

Acessos de demonstração: master / demo123 e operador / demo123. O botão Restaurar exemplos repõe os dados fictícios somente no navegador atual. Não insira dados reais.

## Testar localmente

Na raiz, execute python -m http.server 8080 e abra http://localhost:8080/frontend/.

## Sugestão de postagem

Desenvolvi uma aplicação de gestão financeira com cadastros de clientes e fornecedores, movimentações, contas a pagar, dashboard e exportação de relatórios. O projeto original usa JavaScript, Node.js, Express e SQLite; esta versão de portfólio funciona inteiramente no navegador.

Experimente: [LINK PUBLICADO]
Acesso: operador / demo123. Todos os dados são fictícios.
