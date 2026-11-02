# Plano e Backlog Master: Vitrine de Suplementos (LuhGab Imports)

## [Goal Description]
Construir uma vitrine de alta conversão e impacto visual para a LuhGab Imports, focada no segmento de suplementação esportiva e bem-estar. O projeto conta com arquitetura modular, paleta de cores premium (Dourado, Vermelho e Dark Premium), visualizador 3D interativo (Three.js + GSAP), montador de combos em tempo real, drawer de carrinho com checkout WhatsApp e fluxo de orquestração multi-agente via Maestri com memória externa no Obsidian.

---

## 1. Topologia da Equipe de Agentes (Maestri)

| Agente | Perfil / Modelo | Função Principal |
| :--- | :--- | :--- |
| **Antigravity (Eu)** | Gemini Flash/Pro | **Orquestrador Central (Maestro)**: Arquitetura, quebra de tasks, dispatch no Maestri, validação de entregas e documentação no Obsidian. |
| **Titan** | Claude Sonnet | **Engenheiro Frontend & 3D**: Criação dos componentes React/Next.js, motor 3D Three.js, GSAP, páginas, hooks, filtros, combo builder e carrinho. |
| **Aura** | Claude Haiku | **Styling & Copywriter**: Tokens Tailwind CSS (Dourado/Vermelho/Dark), gradientes, copywriting esportivo de alta conversão, depoimentos, blog e FAQ. |
| **Forge** | OpenCode / Local | **Executor & Dev Server**: Setup do projeto Next.js, scripts de build, instalação de dependências, dev server e testes locais. |
| **Prism** | Claude Sonnet / Vision | **Validador UI/UX**: Avaliação de hierarquia visual, contraste da paleta no dark mode, usabilidade do combo builder, touch no visualizador 3D e responsividade mobile. |
| **Vigil** | Claude Sonnet / Reviewer | **Code & QA Reviewer**: Auditoria técnica de código, TypeScript rigoroso, descarte de memória no Three.js e integridade de build. |

---

## 2. Roadmap Completo de 24 Tasks (8 Fases)

### Fase 1: Fundação, Setup e Design System
- **Task 01 (Forge):** Setup Next.js 15, TypeScript, Tailwind, Lucide, Framer Motion, GSAP, Three.js (`Tasks/01-Task-Forge-Setup-Nextjs-Stack.md`).
- **Task 02 (Aura):** Design Tokens Dourado/Vermelho/Dark, gradientes metálicos, glow shadows, scrollbar estilizada (`Tasks/02-Task-Aura-Design-Tokens-and-Tailwind.md`).
- **Task 03 (Titan):** Gerenciamento de Estado Reativo (CartStore com persistência LocalStorage, WishlistStore e Toasts) (`Tasks/03-Task-Titan-State-Management-Cart-and-Wishlist.md`).
- **Task 04 (Aura):** Sistema de Logo Vetorial SVG responsivo (LuhGab Imports), selo de garantia e favicon (`Tasks/04-Task-Aura-Vector-Logo-and-Branding.md`).

### Fase 2: Estrutura de Dados, Mock Modular & Tipos
- **Task 05 (Titan):** Schemas e Tipagem Estrita TypeScript de Suplementos (`Tasks/05-Task-Titan-TypeScript-Schemas-and-Contracts.md`).
- **Task 06 (Titan):** Catálogo Mock Modular Preparado para 6 Marcas e múltiplos objetivos (`Tasks/06-Task-Titan-Modular-Mock-Catalog-6-Brands.md`).

### Fase 3: Motor 3D & Efeitos GSAP
- **Task 07 (Titan):** Setup da cena Three.js de estúdio e iluminação multicamada (Key Dourada, Rim Vermelha, Fill ambiente) (`Tasks/07-Task-Titan-Threejs-3D-Engine-and-Lighting.md`).
- **Task 08 (Titan):** Modelagem Procedural 3D dos 3 formatos de suplementos (Whey, Creatina/Pré-treino, Frasco de Cápsulas) (`Tasks/08-Task-Titan-Procedural-3D-Product-Models.md`).
- **Task 09 (Titan):** Componente `Product3DViewer.tsx` com controles 360°, auto-rotação, animação de entrada com GSAP e touch seguro mobile (`Tasks/09-Task-Titan-Product3DViewer-Component-and-Controls.md`).

### Fase 4: Header, Navegação, Busca e Footer
- **Task 10 (Titan):** Topbar Promocional, Navbar fixa com blur e Busca Preditiva Instantânea com preview de produtos (`Tasks/10-Task-Titan-Navbar-and-Instant-Search.md`).
- **Task 11 (Titan):** Footer Premium, Newsletter VIP, selos de garantia/laudo e botão flutuante de WhatsApp (`Tasks/11-Task-Titan-Footer-and-Trust-Badges.md`).

### Fase 5: Vitrine Principal & Seções de Alta Conversão
- **Task 12 (Titan):** Hero com Carrossel Dinâmico, countdown regressivo de oferta e animações GSAP (`Tasks/12-Task-Titan-Hero-Carousel-with-GSAP.md`).
- **Task 13 (Titan):** Régua de Vantagens e Navegação visual "Compre por Objetivo" com filtros instantâneos (`Tasks/13-Task-Titan-Benefits-and-Objective-Navigation.md`).
- **Task 14 (Titan):** Catálogo Geral de Produtos com filtros multifacetados por marca (as 6 marcas), categoria e preço (`Tasks/14-Task-Titan-Faceted-Catalog-and-Brand-Filter.md`).
- **Task 15 (Titan):** Montador de Combo Interativo em 3 passos com barra de progresso e desconto progressivo calculado em tempo real (`Tasks/15-Task-Titan-Interactive-Combo-Builder.md`).
- **Task 16 (Titan):** Comparador Rápido de Produtos lado a lado (tabela de nutrientes, preço por dose e calorias) (`Tasks/16-Task-Titan-Product-Comparison-Drawer.md`).

### Fase 6: Página de Produto, Carrinho & Checkout WhatsApp
- **Task 17 (Titan):** Rota dinâmica de Detalhes do Produto (`/produto/[id]`) com visualizador 3D, seletores de sabor/peso, tabela nutricional e simulador de frete (`Tasks/17-Task-Titan-Product-Detail-Page.md`).
- **Task 18 (Titan):** Carrinho Drawer Lateral com barra de frete grátis, cupom e Checkout Express formatado para WhatsApp (`Tasks/18-Task-Titan-Cart-Drawer-and-WhatsApp-Checkout.md`).

### Fase 7: Prova Social, Blog, SEO & Acessibilidade
- **Task 19 (Aura):** Módulo de Prova Social com avaliações verificadas de atletas e clientes (`Tasks/19-Task-Aura-Social-Proof-and-Testimonials.md`).
- **Task 20 (Aura):** Blog Educativo e Guias de Suplementação (Creatina, Whey, Pré-treino) com modal de leitura (`Tasks/20-Task-Aura-Educational-Blog-and-Guides.md`).
- **Task 21 (Aura):** FAQ Interativo em accordion com políticas de envio, laudos e garantia (`Tasks/21-Task-Aura-Interactive-FAQ-and-Policies.md`).
- **Task 22 (Titan):** Infraestrutura de SEO Técnico, dados estruturados Schema JSON-LD e metatags dinâmicas (`Tasks/22-Task-Titan-SEO-Schema-and-Meta-Tags.md`).

### Fase 8: Auditoria UI/UX, Acessibilidade e QA de Build
- **Task 23 (Prism):** Auditoria Completa de UI/UX, contraste Dourado/Vermelho no dark mode, touch 3D e usabilidade mobile (`Tasks/23-Task-Prism-Comprehensive-UI-UX-Audit.md`).
- **Task 24 (Vigil):** Auditoria Técnica de Código, TypeScript estrito, prevenção de memory leaks no Three.js e validação de `npm run build` (`Tasks/24-Task-Vigil-QA-TypeScript-and-Build-Review.md`).

---

## 3. Localização dos Arquivos no Obsidian

Vault: `C:\Users\Jecel\Documents\Obsidian Vault\LuhGab Imports\`
- `00 - Visao Geral do Projeto.md`
- `01 - Stack e Design System.md`
- `02 - Backlog e Tasks dos Agentes.md`
- `Tasks/01-Task-Forge-Setup-Nextjs-Stack.md` até `Tasks/24-Task-Vigil-QA-TypeScript-and-Build-Review.md`
