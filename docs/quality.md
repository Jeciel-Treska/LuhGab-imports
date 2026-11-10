# Qualidade

## Comandos

| Comando | O que prova |
|---|---|
| `npm run typecheck` | `tsc --noEmit` sem erros (TypeScript estrito) |
| `npm run build` | compilação de produção e geração das páginas sem erros |
| `npm run check` | tipos + build; rodar antes de cada commit/push |
| `npm run lint` | **não usar**: ESLint não está configurado e o comando pede configuração interativa |

Não há suíte de testes. Não inventar scripts nem cobertura: validar mudanças com `npm run check` e inspeção no navegador (celular e desktop).

## Regras de código

- Typecheck sem erros nem avisos; sem `any` injustificado nem `@ts-ignore`.
- Componentes focados, uma responsabilidade cada. Meta: arquivos abaixo de ~350 linhas; `ComboBuilder.tsx` e `ProductDetail.tsx` excedem e devem ser divididos quando forem alterados de forma relevante.
- Server Components por padrão; `"use client"` só com estado, efeito ou evento.
- Sem listas de produtos chumbadas em componentes; derivar de `products` + config do lojista.
- Entrada validada no servidor (`parseStoreConfig`); erros sem expor segredos; nunca logar senha ou tokens.
- Código de servidor (`src/lib/storeConfig.ts`, `adminAuth.ts`) não é importado por componentes de cliente.

## Acessibilidade e UI

- Alvos de toque ≥ 44px; contraste suficiente no tema claro (texto `zinc-600` ou mais escuro sobre branco).
- Imagens com `alt` descritivo; ícones decorativos com `aria-hidden`; botões só-ícone com `aria-label`.
- Foco visível em links, botões e campos; formulários com `<label>`.
- Mobile-first: 1 coluna no celular, sem rolagem horizontal; imagens de produto quadradas (`object-contain`).
- Feedback de ações (ex.: "Salvo com sucesso") anunciado de forma acessível (`role`/`aria-live`).

## Estratégia de testes

Sem testes automatizados hoje. Ao adotá-los, priorizar lógica pura de regra de negócio: `parseStoreConfig`, `applyStoreOverrides` (idempotência e cálculo de desconto), regras de desconto do combo e seleção de Ofertas Relâmpago. Não escrever testes que apenas repetem a implementação.

## Revisão após implementação

Revisar pelo risco e pelo diff real. Para o `/admin`, conferir autenticação em todas as rotas `/api/admin/*`, validação de entrada e ausência de segredos em código e logs. Registrar o que foi verificado e os riscos residuais.

## Dependências e entrega

Rodar `npm audit` periodicamente e investigar avisos; build verde não significa auditoria limpa. Checagens são comandos explícitos; sem hooks de Git por padrão. Atualize este documento junto com os scripts que mudarem.
