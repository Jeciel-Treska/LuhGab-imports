# Setup e evidências

## Pré-requisitos

- Node.js 20+ e npm. Windows, macOS ou Linux.
- Conta na Vercel e um banco Upstash Redis (ou integração Upstash/KV pela Vercel) para produção.

## 1. Instalar

```bash
npm install
```

## 2. Variáveis de ambiente (`.env.local`)

Copie `.env.example` para `.env.local` (arquivo ignorado pelo Git) e preencha:

| Variável | Obrigatória | Para quê |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | sim | WhatsApp de vendas, com DDI+DDD (ex.: `5541995609501`) |
| `NEXT_PUBLIC_SITE_URL` | sim em produção | URL pública (metadados, sitemap, Open Graph) |
| `ADMIN_PASSWORD` | para usar `/admin` | senha do lojista, mínimo 8 caracteres; sem ela o `/admin` responde 503 |
| `ADMIN_SESSION_SECRET` | recomendada | segredo aleatório que assina o cookie de sessão (sem ele, deriva da senha) |
| `ADMIN_API_TOKEN` | opcional | token para automação/CLI (header `x-admin-token`) |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | produção | Upstash Redis/Vercel KV; alternativa: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` |
| `STORE_CONFIG_KV_KEY` | opcional | nome da chave no Redis (padrão `luhgab_store_config`) |
| `STORE_CONFIG_PATH` | opcional | caminho alternativo do JSON de configuração local |

Gerar um segredo: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
Nunca versionar `.env.local` nem colar valores reais em documentos.

## 3. Rodar localmente

```bash
npm run dev                                  # desenvolvimento em http://localhost:3000
npm run check                                # tipos + build
npm run build && npm run start -- -p 3000    # modo produção local
```

Sem variáveis de KV, o `/admin` grava em `data/store-config.json`.

## 4. Deploy na Vercel com Upstash

1. Suba o repositório (GitHub, branch `main`) e importe o projeto na Vercel (framework Next.js detectado).
2. Em **Storage**, crie/conecte um banco **Upstash Redis** (Marketplace). A integração injeta `KV_REST_API_URL` e `KV_REST_API_TOKEN` (ou prefixo equivalente — o código aceita qualquer `*_REST_API_URL/_TOKEN`).
3. Em **Settings → Environment Variables**, defina `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_SITE_URL` para Production (e Preview, se desejado).
4. Faça o deploy (push em `main`). Confira em `/admin` que o login funciona e que salvar preços reflete na vitrine.
5. Sem KV, a Vercel usa `/tmp` — as edições somem em novas instâncias. Não use assim em produção.

## Checks

| Item | Estado | Evidência |
|---|---|---|
| `tsc --noEmit` | validado | 0 erros nas últimas entregas |
| `npm run build` | validado | 41 páginas geradas sem erros |
| Lint | indisponível | ESLint não instalado; `next lint` exigiria configuração interativa |
| Testes automatizados | indisponíveis | não há suíte |
| `/admin` ponta a ponta com Upstash | pendente | requer credenciais Upstash reais |
| Navegador (visual/mobile) | verificação manual | feita pelo lojista; não automatizada |

## Pendências

- Criar o Upstash e validar o `/admin` em produção.
- Fotos faltantes: Dimethylex, Tasty Whey Original 900g, ângulo extra da Max Titanium Creatina.
- Decidir sobre ESLint e testes (ver `docs/quality.md`).

## Manutenção

Registre aqui mudanças de variáveis, passos de deploy e resultados de checagens. Sem credenciais nem caminhos pessoais.
