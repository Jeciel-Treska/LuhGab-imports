# LuhGab Imports

> Instruções para agentes de código. Mantenha curto; detalhes ficam nos documentos apontados.

## Produto e stack

- Escopo do produto: `PRODUCT.md`.
- Stack: Next.js 15 (App Router), React 19, TypeScript estrito, Tailwind CSS 3.4, lucide-react, npm (`package-lock.json`). Persistência do painel: Upstash Redis REST (com fallback em arquivo/`/tmp`). Sem banco relacional.
- Arquitetura e decisões: `docs/architecture.md`. Setup, variáveis e deploy: `docs/setup.md`. Qualidade e checagens: `docs/quality.md`.

## Comandos canônicos

- Instalar: `npm install`
- Desenvolver: `npm run dev` (porta 3000)
- Lint: indisponível — ESLint não está instalado/configurado (`npm run lint` pediria configuração interativa). Não inventar regras.
- Tipos: `npm run typecheck` (`tsc --noEmit`)
- Testes: indisponíveis — não há suíte de testes.
- Build: `npm run build`
- Verificação completa: `npm run check` (tipos + build)
- Produção local: `npm run build && npm run start -- -p 3000`

## Regras da stack

- TypeScript estrito; sem `any` desnecessário e sem `@ts-ignore`. `tsc --noEmit` deve terminar com 0 erros.
- Server Components por padrão; `"use client"` só onde há estado, efeito ou evento.
- Visual **clean minimalista, tema claro** (fundo branco/zinc, acentos esmeralda e âmbar). Não reintroduzir classes de tema escuro nem o visualizador 3D (removido; só fotos estáticas dos produtos).
- Tailwind: alvos de toque ≥ 44px, grade de 1 coluna no celular, imagens de produto quadradas com `object-contain`. Classes inexistentes (ex.: `h-13`) não geram erro — conferir na `tailwind.config.ts`.
- Ícone do WhatsApp: sempre `src/components/WhatsAppIcon.tsx`.
- Preços, destaques e Ofertas Relâmpago vêm de `src/data/products.ts` + overrides do lojista (`src/lib/storeConfig.ts`). Não chumbar listas de produtos em componentes; filtrar por `isFeatured`/`isBestSeller`/config.
- Segredos só em `.env.local` (ignorado pelo Git). Nunca versionar `ADMIN_PASSWORD`, tokens do Upstash nem `data/store-config.json`.
- `/admin` e `/api/admin/*` exigem sessão (cookie assinado `lg_admin`); toda entrada passa por `parseStoreConfig`.
- O acesso ao `/admin` fica apenas no rodapé ("Área do Lojista"); não colocar no Navbar.

## Mapa de documentos

- `PRODUCT.md` — escopo, fluxos, requisitos e critérios de aceite.
- `docs/architecture.md` — stack, mapa de código, fluxo de dados, persistência híbrida, decisões.
- `docs/setup.md` — variáveis de ambiente, execução local, deploy na Vercel + Upstash.
- `docs/quality.md` — checagens, regras de código, acessibilidade, revisão.

Atualize o documento responsável a cada mudança, sem duplicar regras entre eles.

## Combinados de trabalho

- Leia o código e as instruções relevantes antes de editar; declare suposições que afetam comportamento.
- Faça a menor mudança suficiente; reutilize padrões, componentes e dependências existentes. Sem abstrações, opções ou dependências não pedidas.
- Preserve alterações locais, validação, tratamento de erro, segurança e acessibilidade.
- Não trate suposição como fato nem integração pendente como resultado simulado.
- Outras sessões/agentes podem editar o mesmo projeto: um escritor por arquivo; confira o estado atual antes de sobrescrever.
- Commit, push, deploy e qualquer ação destrutiva ou externa só com autorização do usuário. Mensagens de commit em português, no formato `tipo: descrição`.
- Responda em português do Brasil. Código, documentação e commits em linguagem normal.

## Git

- Branch principal: `main`, remoto `origin` (GitHub). Sem hooks de pre-commit/pre-push nem bloqueios por padrão.
- Antes de commitar: `npm run check`. `git add .` leva também alterações de outras sessões — confira `git status` antes.

## Convenções

- Alias de import `@/` → `src/`.
- Dados do catálogo em `src/data`; tipos em `src/types`; lógica de servidor e validação em `src/lib`; contextos de cliente em `src/context`.
- Textos de interface em português do Brasil; valores em BRL via `formatBRL` (`src/lib/format.ts`).
