# PLAN — Consolidação TC Telecom no Azure

## Fase 0 — Bootstrap
Status: CONCLUÍDA (2026-08-15)
- [x] Bloqueador P0 resolvido: e-mail fora de escopo, UOL não é
      cancelada (ver ADR-003)
- [x] Projeto B confirmado no escopo
- [x] Projeto relocado para C:\dev\telecomtc-site (fora do OneDrive)
- [x] CLAUDE.md criado
- [x] docs/ADR-001, ADR-002, ADR-003 criados
- [x] git init + .gitignore
- [x] primeiro commit

## Projeto A — Site no Azure
Status: EM ANDAMENTO (Fase A1)

### Fase A1 — Gates, inventário e backups
- [x] A1.1 Gate de viabilidade — **PASSOU**: 89 arquivos, 6,7 MB total
      (alvo 12.000/200 MB, limite duro 15.000/250 MB). Uploads: 4,2 MB.
      Script: `scripts/mirror-gate.mjs` (substitui wget --mirror).
- [x] A1.2 Contrato de URLs — `url-contract.txt` com 25 URLs de
      conteúdo real (4 páginas + 1 duplicata apex-sem-barra + 20 mídias
      enviadas). 64 ativos de implementação WP/Elementor ficaram em
      `mirror-crawl-full.txt`, fora do contrato (ver CLAUDE.md >
      Ambiente — não fazem sentido no smoke test nem no redirect).
- [x] A1.3 Snapshot de DNS — `dns-snapshot-20260815.txt`, gerado por
      `scripts/dns-snapshot.mjs` (substitui dig). Confirma o estado
      descrito no runbook, incluindo as anomalias de SPF/DMARC
      duplicados em telecomtc.com.br (documentadas em CLAUDE.md).
- [x] A1.4 Backups — **satisfeito em 2026-08-15** via backup completo da
      conta cPanel na UOL (`backup-8.15.2026_03-20-03_telecomtfd36636a.tar.gz`,
      428 MB, fornecido pelo usuário). Cobre arquivos do site + dump
      MySQL + dados de e-mail (Maildir) — mais abrangente que o WXR
      originalmente pedido. Extraído *fora* do repo e do OneDrive (em
      scratch local), nunca commitado — contém credenciais de banco e
      dados de e-mail. Detalhes e achados abaixo.
      - Export IMAP das caixas `@telecomtc.com.br`: deixou de ser P0
        bloqueante (ADR-003 — UOL não será cancelada), mas o backup
        cPanel já inclui os dados de e-mail (Maildir) como bônus.

### Achados da análise do backup (banco de dados + arquivos)
- Site é WordPress + Elementor/Elementor Pro. Banco:
  `telecomtfd36636a_claroc1`, prefixo de tabela `apswp_`.
- Confirma as 4 páginas já conhecidas do crawl (`/`, `/empresa/`,
  `/fale-conosco/`, `/servicos/`) e revela mais 2 não linkadas em nenhum
  menu (por isso o crawl não as achou): `/oferta-sms/` (landing page de
  campanha antiga, ainda responde 200) e `/sample-page/` (página padrão
  do WordPress, sem conteúdo real). `/contato/` também existe no banco
  mas redireciona (301) para a home — não é conteúdo próprio.
- **Decisão do usuário (2026-08-15)**: `/oferta-sms/` NÃO é migrada —
  deixa de existir (404) após a migração. `/sample-page/` também não
  (é lixo de instalação padrão do WP).
- `wp-content/uploads/` no backup tem **538 arquivos / 106,8 MB**, mas
  só ~20 são referenciados pelas páginas reais (já capturados via crawl
  em `mirror-uol/`). O resto é mídia órfã (campanhas antigas, anexos
  não usados). Decisão: migrar só o que é referenciado pelas páginas
  reais — não carregar as ~518 imagens órfãs para o site novo (poda,
  conforme runbook §10.2).
- Nenhum blog real — só o post padrão "Hello world!" do WordPress
  (não migra).
- **3 scripts de rastreamento/marketing carregados em todas as páginas**
  via Elementor (Theme Builder → Custom Code), achados em
  `apswp_postmeta._elementor_code`:
  - Meta tag de verificação de domínio do Facebook Business
    (`facebook-domain-verification`, content=`esf9tpilmeogkrjmgleuxpo75kv6y8`)
  - Loader do RD Station (`https://d335luupugsy2.cloudfront.net/js/loader-scripts/1d67f0f8-3a7b-4474-8daa-846e9ff074b1-loader.js`)
  - Google tag / GA4 (`gtag.js`, measurement ID `G-0FFBNFM94W`)
  - **Decisão do usuário (2026-08-15)**: preservar os 3 no site novo —
    entram no `layout.tsx` na Fase A3.
- Templates Elementor site-wide encontrados: `menu-principal` (header/
  nav) e `rodape-oficial` (footer) — confirmam que header/footer são
  compartilhados entre páginas, mapeiam bem para `layout.tsx`.
- **Descoberta fora de escopo, só FYI**: as zonas DNS da conta cPanel
  incluem um segundo domínio, `vivoempresa5g.com.br`, não mencionado em
  nenhum documento do projeto. Não investigado, não faz parte deste
  projeto — só registrado para o usuário estar ciente.

Critério de saída (portão A→B): site 200 nos dois hostnames + smoke
verde + regressão de e-mail sem divergência + 7 dias corridos estável +
WordPress desinstalado da UOL.

## Fase A2 — Extração para Next.js
Status: CONCLUÍDA (2026-08-15)
Conteúdo das 4 páginas (home, `empresa`, `servicos`, `fale-conosco`)
extraído do HTML renderizado em `mirror-uol/` (não do JSON do Elementor
— ver CLAUDE.md > Ambiente) e recriado manualmente como componentes
Next.js. `wp-content/uploads/` movido para `public/` preservando os
paths originais (só os ~20 arquivos referenciados pelas páginas reais).

## Fase A3 — Next.js (scaffold, páginas, config)
Status: CONCLUÍDA (2026-08-15)
- Scaffold: Next.js 16.3.1 (não 15 — versão atual no momento da
  execução), App Router, TypeScript, Tailwind v4, `src/` dir.
  `create-next-app` rodado numa pasta temporária e mesclado no repo
  (o diretório já tinha CLAUDE.md/PLAN.md/docs/scripts) — ver CLAUDE.md
  > Ambiente para as diferenças em relação ao runbook original (Next 15
  → 16: `sitemap.ts`/`robots.ts` agora exigem
  `export const dynamic = 'force-static'` com `output: 'export'`).
- `next.config.ts`: `output: 'export'`, `trailingSlash: true`,
  `images.unoptimized: true` — como especificado.
- Páginas: `/` (home com formulário de contato), `/empresa/`,
  `/servicos/` (com anchors `#vivo-movel` etc. para os links "Saiba
  mais" da home), `/fale-conosco/` (formulário de candidatura — o nome
  da rota preserva a URL atual, mesmo a página sendo "Trabalhe
  Conosco" no site atual, não "Fale Conosco" — ver achados da Fase
  A1.4).
- `layout.tsx`: header/footer compartilhados, canonicalização via
  `metadataBase`, os 3 scripts de rastreamento preservados (decisão do
  usuário — ver achados A1.4), ícones a partir dos
  `cropped-vivo-1-1-*.png` já existentes.
- Formulários: Web3Forms (`ContactForm.tsx`, `JobApplicationForm.tsx`),
  client components. **Pendente do usuário**: criar conta em
  web3forms.com e preencher `NEXT_PUBLIC_WEB3FORMS_KEY` em `.env.local`
  (ver `.env.example`) — sem isso os formulários não enviam.
- `sitemap.ts`, `robots.ts`, `not-found.tsx`, `staticwebapp.config.json`
  do site (rotas 404 para wp-admin/wp-login/xmlrpc, redirect de
  `/contato/` para `/` preservando o comportamento atual, CSP liberando
  os domínios do Web3Forms/RD Station/Google).
- **Build verificado**: `npm run build` gera `./out` sem erro — 5,1 MB,
  63 arquivos (bem dentro do alvo 200 MB/12.000). `npm run lint` limpo
  (precisou excluir `mirror-uol/**` do ESLint — sem isso ele lintava o
  JS de terceiros baixado no crawl da Fase A1 e gerava milhares de
  falsos positivos).
- **Verificado visualmente** (Playwright + Chromium headless, instalado
  só para este teste): as 4 páginas renderizam corretamente, imagens
  reais carregando, formulários com os campos certos. Único item
  observado: o RD Station injeta um botão flutuante de WhatsApp
  sitewide — comportamento herdado do script original, não é bug.
- **Todas as 25 URLs de `url-contract.txt` respondem 200** contra o
  build local (`out/` servido via `serve`).

Critério de saída (portão A→B): site 200 nos dois hostnames + smoke
verde + regressão de e-mail sem divergência + 7 dias corridos estável +
WordPress desinstalado da UOL.

## Fase A5 — Provisionar e publicar
Status: CONCLUÍDA (2026-08-15)

- [x] Chave do Web3Forms recebida (`92de5971-49f0-4f20-932a-db295642a1d7`)
      — em `.env.local` (gitignored) e pronta para virar GitHub Secret.
- [x] Repositório GitHub criado pelo usuário
      (`https://github.com/azrhaell/telecomtc-site`). Tinha um commit
      inicial (LICENSE MIT + README) feito pela UI do GitHub — mesclado
      com `--allow-unrelated-histories`, sem conflito.
- [x] Código empurrado para `origin/main`.
- [x] `.github/workflows/azure-swa-site.yml` criado e commitado —
      pré-builda no próprio workflow (Node 22) em vez de depender do
      Oryx, `skip_app_build: true`.
- [x] **Conta Azure corrigida (2026-08-15)**: a subscription original
      (`ea3426a8-9e71-4eee-a507-d45733895f6e`, conta
      azrhaell700@hotmail.com) estava desabilitada — mas era a conta
      errada. A conta certa é **marcelo.lobo@tctelecom.com.br**,
      subscription `429399fe-5db9-4e28-af3c-76528296c5db` (tenant "TC
      REPRESENTACAO COMERCIAL LTDA", domínio tctelecom.com.br), estado
      Enabled. Login trocado via `az login --use-device-code`.
- [x] `az group create -n rg-tctelecom -l eastus2` — criado.
- [x] `Microsoft.Web` precisou ser registrado na subscription (comum em
      subscription nova): `az provider register --namespace
      Microsoft.Web` — levou ~70s.
- [x] `az staticwebapp create -n swa-telecomtc-site -g rg-tctelecom -l
      eastus2 --sku Free` — criado. Hostname:
      `gentle-field-06f152f0f.7.azurestaticapps.net`.
- [x] Deployment token obtido via `az staticwebapp secrets list`.
- [x] Usuário adicionou os 2 GitHub Secrets (`AZURE_SWA_TOKEN_SITE`,
      `NEXT_PUBLIC_WEB3FORMS_KEY`) em Settings → Secrets and variables
      → Actions.
- [x] Workflow disparado via `workflow_dispatch` (API, usando o token
      OAuth do próprio git credential manager local — mesmo usado pro
      `git push`, sem escalar privilégio) — run concluído com sucesso
      (id 31915738235).
- [x] **Site validado ao vivo em
      `https://gentle-field-06f152f0f.7.azurestaticapps.net`**: as 4
      rotas (`/`, `/empresa/`, `/servicos/`, `/fale-conosco/`)
      respondem 200, título correto, logo carregando, chave do
      Web3Forms confirmada presente no HTML servido (veio do secret via
      CI, não do `.env.local`). Todas as 25 URLs de `url-contract.txt`
      respondem 200 contra essa URL.
- [x] Produção (`telecomtc.com.br`, UOL) confirmada intocada — segue
      200 normalmente.

**Critério de saída da Fase A5 atendido**: site funciona integralmente
pela URL `*.azurestaticapps.net`, produção ainda 100% na UOL.

## Correção de fidelidade visual (2026-08-15, pós-A5)
Status: CONCLUÍDA

Usuário apontou que o site publicado ficou visualmente diferente do
original — a Fase A2/A3 tinha extraído o conteúdo certo mas
reconstruído com paleta/tipografia/composição inventadas, não a
aparência real do site. Corrigido:

- Paleta e tipografia reais extraídas do CSS do Elementor (não
  inventadas) — ver CLAUDE.md > Ambiente para os valores exatos (roxo
  `#65009F`, rosa neon `#FF0096`, fonte de título "Bree Serif").
- **Achado importante**: `scripts/mirror-gate.mjs` (Fase A1) só segue
  `href`/`src`/`srcset` de HTML — não segue `background-image:url()`
  do CSS nem galerias de slideshow do Elementor. Isso deixou de fora
  ~11 imagens de fundo reais (incluindo o hero inteiro da home, que é
  um slideshow de 3 banners prontos com texto já embutido nas
  imagens). Baixadas manualmente e adicionadas a `url-contract.txt`.
  Detalhe técnico completo em CLAUDE.md > Ambiente.
- 4 páginas reescritas via workflow paralelo (4 agentes, 1 por página)
  com specs precisas de cor/fonte/imagem/copy; 1 retry necessário (erro
  de conexão da API, não do conteúdo). Componentes novos:
  `CookieBanner.tsx` (banner de cookies LGPD, existia no original e
  tinha ficado de fora), `HeroSlideshow.tsx` (carrossel de 3 banners da
  home).
- Verificação: build limpo, lint limpo, as 25 URLs do contrato
  (atualizado) respondem 200, screenshots das 4 páginas comparados
  lado a lado com o original — bateram bem. Sem erros de console além
  do 400 esperado do RD Station rejeitando origem localhost.
- Deploy: push para main, workflow do GitHub Actions publica
  automaticamente.

## Fase A6 — Zona DNS, cutover e validação
Status: PENDENTE — não iniciada.

Vai envolver: popular a zona `telecomtc.com.br` no Azure DNS como
espelho verbatim do snapshot (`dns-snapshot-20260815.txt`, incluindo as
anomalias de SPF/DMARC já documentadas — não corrigir), adicionar só o
alias A no apex + CNAME `www` → SWA, escrever
`scripts/mail-regression.sh` **antes** de qualquer mudança de DNS, e só
depois disso pedir para o usuário trocar os NS no registro.br (TTL 300s
72h antes). É o primeiro passo com potencial de afetar e-mail em
produção (mesmo que só por erro de espelhamento) — confirmar com o
usuário antes de começar, não assumir sinal verde automático só porque
a A5 terminou bem.

## Projeto B — Redirect tctelecom.com.br
Status: PENDENTE (depende do portão A→B)

Critério de saída: 4 hostnames validados + regressão de e-mail verde nos
dois domínios.

## Projeto C — E-mail + cancelamento da UOL
Status: FORA DE ESCOPO — não será executado (ver ADR-003, decisão de
2026-08-15). UOL permanece ativa indefinidamente como provedora de
e-mail de @telecomtc.com.br.
