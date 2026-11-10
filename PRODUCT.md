# LuhGab Imports

## Problema e objetivo

Loja online de suplementos (importados e nacionais) para clientes que querem comprar com confiança de procedência. A venda é fechada direto pelo WhatsApp: a vitrine apresenta o catálogo, o carrinho monta o pedido e o cliente finaliza a conversa com o lojista. O objetivo é converter visitantes em pedidos no WhatsApp, com preços sempre atualizados pelo próprio lojista.

## Público e papéis

- **Cliente:** navega pelo celular (maioria) ou desktop, compara produtos, monta combos e pede pelo WhatsApp. Sem cadastro nem login.
- **Lojista:** único administrador. Acessa `/admin` com senha (link "Área do Lojista" no rodapé) para gerir preços e destaques.

## Fluxos da versão atual

- **Vitrine (home):** Hero em destaque (produto fixado ou sorteado entre destaques/lista do lojista), Destaques da Loja (produtos marcados como destaque), Ofertas Relâmpago, categorias, marcas e kits.
- **Catálogo e produto:** `/produtos` com filtros e busca; `/produto/[id]` com galeria de fotos estáticas, sabores/tamanhos, preço, Pix e parcelamento.
- **Compra pelo WhatsApp:** adicionar ao carrinho ou "Pedir pelo WhatsApp"; "Finalizar Pedido pelo WhatsApp" abre a conversa com o pedido pronto.
- **Montador de combos (`/montar-combo`):** abas por categoria, vários itens por etapa, desconto progressivo — 2 itens = 10%, 3 = 15%, 4 ou mais = **até 20% OFF** —, barra fixa no celular.
- **Favoritos e comparação** de produtos.
- **Painel `/admin`:** login por senha; editar preço, preço original e % de desconto; marcar Destaque e Mais vendido; escolher o Hero (fixo ou sorteio); configurar Ofertas Relâmpago (automático pelos maiores descontos, ou manual com produtos escolhidos). Salva com feedback "Salvo com sucesso" e reflete na vitrine sem novo deploy.
- Páginas institucionais: sobre, ajuda, autenticidade, rastreio, termos e privacidade.

## MVP (entregue)

1. Catálogo com 33 produtos e fotos oficiais.
2. Carrinho e pedido via WhatsApp.
3. Montador de combos com até 20% OFF.
4. Painel `/admin` para preços, destaques, Hero e Ofertas Relâmpago.

## Fora de escopo

- Checkout com pagamento online, contas de cliente, estoque em tempo real, múltiplos lojistas/perfis.
- Visualizador 3D (removido; apenas fotos estáticas).
- Banco relacional ou ORM.

## Requisitos

- Idioma pt-BR; moeda BRL; Pix com desconto e parcelamento sem juros exibidos.
- Mobile-first: 1 coluna no celular, alvos de toque ≥ 44px, imagens de produto quadradas.
- Visual clean minimalista, tema claro.
- Acessibilidade: textos alternativos nas fotos, rótulos em controles, foco visível.
- Segurança: `/admin` e `/api/admin/*` só com sessão; senha e segredos em variáveis de ambiente; `/admin` e `/api/` fora de `robots.txt`.
- Número de WhatsApp e URL do site configuráveis por ambiente.

## Restrições e decisões técnicas

- Next.js 15 (App Router), React 19, TypeScript estrito, Tailwind 3.4, npm.
- Persistência das edições do lojista: Upstash Redis REST em produção; arquivo/`/tmp` como fallback (ver `docs/architecture.md`). Escolha deliberada de não usar banco relacional: o volume é um único JSON de configuração.
- Hospedagem prevista: Vercel.

## Suposições e decisões pendentes

- Fotos faltantes (Dimethylex, Tasty Whey Original 900g, ângulo extra da Max Titanium Creatina): aguardam arquivos do lojista.
- Sem Upstash configurado na Vercel, as edições do `/admin` ficam em `/tmp` (efêmeras e por instância); configurar KV antes de usar o painel em produção.
- Não há ESLint nem testes automatizados; adoção é decisão futura.

## Critérios de aceite

- Marcar/desmarcar Destaque no `/admin` altera a seção "Destaques da Loja"; lista vazia mostra aviso e os primeiros produtos.
- Alterar preço/desconto no `/admin` aparece nos cards, produto, carrinho e Hero.
- Ofertas Relâmpago no modo manual exibem exatamente os produtos escolhidos; no automático, os de maior desconto (> 0) em estoque.
- Combo com 2/3/4+ itens aplica 10/15/20% de desconto.
- `npm run check` termina com 0 erros.

## Próxima entrega

Configurar o Upstash na Vercel e validar o fluxo completo do `/admin` em produção.

## Manutenção

Atualize este documento quando objetivo, escopo, restrições ou critérios mudarem. Decisões técnicas e evidências ficam em `docs/architecture.md` e `docs/setup.md`.
