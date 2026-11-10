# Código e arquitetura

## Stack real

- Next.js 15.5 (App Router), React 19.1, TypeScript 5.9 estrito, Tailwind CSS 3.4, lucide-react, framer-motion/gsap (animações pontuais). Gerenciador: npm (`package-lock.json` é a fonte das versões exatas).
- Runtime Node.js nas rotas de API (`export const runtime = "nodejs"`).
- Persistência: um único documento JSON de configuração da loja (sem ORM nem banco relacional — decisão deliberada, ver "Decisões").

## Mapa de código

```
src/
  app/                 rotas (App Router)
    page.tsx           home: Hero, Destaques, Ofertas Relâmpago, categorias, marcas
    produtos/          catálogo com filtros
    produto/[id]/      página de produto (SSG de 33 produtos + overrides aplicados no RSC)
    montar-combo/      montador de combos
    admin/             painel do lojista (login ou AdminDashboard)
    api/admin/*        login, logout, store (grava config), products, config
    api/store/config   leitura pública da config (ressincronização do cliente)
    layout.tsx         carrega a config e envolve a árvore em StoreConfigProvider
  components/          UI (Navbar, Footer, ProductCard, ComboBuilder, FlashDeals, ...)
    admin/             AdminDashboard, AdminLogin, Switch
  context/             Cart, Wishlist, Compare (estado de cliente)
  data/                products.ts (catálogo + baseline + applyStoreOverrides), site.ts, faq, marcas...
  lib/                 storeConfig.ts (servidor), adminAuth.ts, storeConfigClient.ts, format.ts, whatsapp.ts
  types/               product.ts, store.ts (HeroConfig, FlashDealsConfig, StoreConfig)
data/store-config.json estado gravado pelo /admin (ignorado pelo Git)
public/products/       fotos dos produtos (PNG 1000x1000 transparente)
scripts/               utilitários (ex.: process_photos.py para remover fundo)
```

## Fronteiras e fluxo

1. **Catálogo base:** `src/data/products.ts` define os 33 produtos e um mapa `baseline` imutável.
2. **Overrides do lojista:** `/admin` → `POST /api/admin/store` → `parseStoreConfig` (valida Hero, Ofertas Relâmpago, preços, flags) → `persist` → `revalidatePath("/", "layout")`.
3. **Leitura no servidor:** `layout.tsx` chama `loadStoreConfig()` (cache de 2 s) e `applyStoreOverrides()`; `StoreConfigProvider` (cliente) reaplica os overrides durante o render, para SSR e navegador mostrarem os mesmos valores. `produto/[id]/page.tsx` também aplica os overrides no RSC.
4. **Ressincronização no cliente:** o provider consulta `GET /api/store/config` (na hidratação, ao voltar à aba e a cada 60 s); se houver divergência, atualiza os contextos e faz `router.refresh()` com limite de 30 s.
5. **Reatividade:** componentes de cliente que leem `products` (mutado em memória) assinam `useStoreOverrides()`, `useHeroConfig()` ou `useFlashDealsConfig()` para re-renderizar quando a config muda.
6. **Autenticação:** senha única (`ADMIN_PASSWORD`) → cookie `lg_admin` httpOnly, sameSite=strict, HMAC-SHA256, 12 h; `timingSafeEqual`; freio de tentativas no login; `secure` só em HTTPS.

Código de servidor (`src/lib/storeConfig.ts`, `adminAuth.ts`) detém o ambiente e a persistência; componentes de apresentação não acessam armazenamento.

## Rotas dinâmicas sob demanda

Como o layout lê a configuração a cada requisição, quase todas as rotas são renderizadas sob demanda (`ƒ` no `next build`). Exceção: `/produto/[id]`, gerada estaticamente para os 33 produtos (`generateStaticParams`) e com overrides aplicados na camada de servidor. `/admin` usa `force-dynamic`.

## Persistência híbrida

Ordem de leitura/gravação em `src/lib/storeConfig.ts`:

1. **Upstash Redis / Vercel KV (REST)** — se existir qualquer par `*_REST_API_URL` + `*_REST_API_TOKEN` (`KV_`, `UPSTASH_REDIS_`, `STORAGE_`...). Chave padrão `luhgab_store_config` (`STORE_CONFIG_KV_KEY`). Fonte da verdade, compartilhada entre instâncias.
2. **Arquivo local** — `data/store-config.json` (ou `STORE_CONFIG_PATH`) em ambiente local/VPS; gravação atômica (arquivo temporário + rename) e serializada por fila.
3. **`/tmp`** — na Vercel sem KV, `/tmp/store-config.json` (gravável, mas efêmero e por instância); em dev local, `os.tmpdir()` como último recurso.

Falha no KV cai para os destinos locais; se nenhum gravar, `StoreConfigStorageError` explica o que configurar. Configuração inválida lida do storage cai no `DEFAULT_STORE_CONFIG`, para a vitrine nunca sair do ar.

## Dados e migrações

Não há schema de banco nem migrações. O formato é `StoreConfig` (`src/types/store.ts`): `hero`, `flashDeals`, `products` (overrides por ID) e `updatedAt`. Campos novos devem ser opcionais, com padrão em `parseStoreConfig`, para ler arquivos antigos sem migração.

## Decisões

- **Sem ORM/banco relacional:** o único dado mutável é um JSON pequeno; KV + arquivo cobre local e Vercel com custo e complexidade mínimos. Revisitar se surgirem pedidos, clientes ou estoque persistidos.
- **Sem 3D:** o visualizador three.js foi removido; só fotos estáticas (menos JS, imagens mais confiáveis).
- **Overrides sobre baseline idempotente:** `applyStoreOverrides` sempre parte do baseline, então reaplicar não acumula efeitos.
- **Tema claro minimalista** como único tema.

## Manutenção

Atualize este mapa quando diretórios, dependências relevantes, contratos ou fronteiras mudarem.
