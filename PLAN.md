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

## Animações (2026-08-15, pós-correção de fidelidade)
Status: CONCLUÍDA

Usuário revisou o site num outro ambiente de design (fora deste
projeto) e trouxe um pacote de handoff (`design_handoff_animacoes/`,
lido e aplicado, não commitado no repo) recriando as animações do
Elementor original que a migração não tinha capturado:

- `Reveal.tsx` (novo) — entrada ao rolar (fade/slide) via
  IntersectionObserver, usado em títulos/colunas/cards nas 4 páginas.
  Só ativa se IntersectionObserver existir; sem JS o conteúdo
  permanece visível.
- `ParticlesNetwork.tsx` (novo) — canvas com pontos e linhas em
  movimento, substitui o `.network-pattern` estático (que virou
  fallback) na seção "SOLUÇÕES TC TELECOM" da home. Respeita
  `prefers-reduced-motion`.
- `HeroSlideshow.tsx` — crossfade de 1s (era 700ms) + Ken Burns
  (zoom lento) + dots clicáveis com `aria-current`.
- `.neon-text` ganhou pulso (`tc-neon`); chevron do hero de /empresa/
  ganhou `tc-bounce`; hovers de botões/cards/ícones sociais com
  elevação e sombra; item de nav ativo com borda inferior rosa
  (`usePathname()` no `Header.tsx`).
- `not-found.tsx` recebeu o mesmo stagger de entrada e teve os
  `#4a0072` hardcoded trocados por `brand-purple` (ficou pra trás na
  correção de fidelidade anterior).
- **Não copiado**: `WhatsAppFloat.tsx` do pacote — o RD Station já
  injeta um botão flutuante; usar os dois duplicaria.
- Paleta, Web3Forms, `staticwebapp.config.json`, `next.config.ts`,
  scripts de rastreamento e `public/wp-content/uploads/` — intocados,
  conforme restrição do próprio handoff.

Verificação: lint limpo, build limpo (12 MB / 87 arquivos), as 25 URLs
do contrato respondem 200, screenshots com scroll simulado (pra
disparar os IntersectionObserver) conferidos nas 4 páginas — nenhum
conteúdo preso invisível, nav ativo correto por rota, partículas
renderizando. Sem erro de console novo.

## Correção de header (2026-08-15, pós-animações)
Status: CONCLUÍDA

Usuário reportou que o clone continuava visualmente divergente do
original, principalmente no Hero. Comparação lado a lado (screenshot +
medição via `getBoundingClientRect`/`getComputedStyle` no DOM real dos
dois sites, não só visual) achou a causa raiz — não era o Hero em si,
era o **Header** acima dele, que compacta toda a composição do topo:

| Elemento | Original (medido) | Clone (antes) | Causa |
|---|---|---|---|
| Logo esquerda (Vivo Empresas) | 135×69px | 78×40px | `h-10` fixo demais |
| Logo direita (TC Telecom) | 207×78px | 130×32px (`h-8`) | idem |
| Fonte do menu | 16px | 14px (`text-sm`) | classe errada |
| Botão "FALE CONOSCO" | texto literal maiúsculo no HTML original | "Fale Conosco" | case errado |

Corrigido em `Header.tsx`: `h-[69px]`/`h-[78px]` nos dois logos (width/
height do `next/image` ajustados para bater com o tamanho real
renderizado), `text-base` no menu, `uppercase` no botão do WhatsApp.
Header shared entre as 4 páginas, então o fix vale para todas.

Verificado por medição (não só olho): logos agora 135×69 e 207×78,
batendo exato com o original; fonte do menu 16px; botão com
`text-transform: uppercase`. Build/lint limpos, 25 URLs 200, publicado.

## Fase A6 — Zona DNS, cutover e validação
Status: EM ANDAMENTO (2026-08-16) — travada aguardando 2 TXT na UOL

### A6.1 — Zona espelho no Azure DNS: CONCLUÍDA
Zona `telecomtc.com.br` criada em `rg-tctelecom`, com os registros de
e-mail espelhados **byte a byte** do `dns-snapshot-20260815.txt`,
incluindo as anomalias preservadas de propósito (dois TXT de SPF, um
deles malformado; dois TXT `_dmarc`):

| Registro | Valor |
|---|---|
| MX `@` | `10 mx.uhserver.com` |
| TXT `@` | `v=spf1include:_spf.rdstation.com.brinclude:sendgrid.net~all` + `v=spf1 include:spf.whservidor.com ?all` |
| TXT `_dmarc` | `v=DMARC1` + `v=DMARC1; p=none;` |
| A `mail`/`pop` | `200.147.69.9` |
| A `webmail` | `200.147.66.3` |
| A `smtp` | `200.147.36.31` |
| A `imap`/`pop3` | `200.147.41.245` |
| A `@` | **alias** → recurso `swa-telecomtc-site` |
| CNAME `www` | `gentle-field-06f152f0f.7.azurestaticapps.net` |

Conferido consultando os nameservers do Azure direto (`ns1-04.azure-dns.com`):
a zona nova devolve exatamente os mesmos valores de e-mail da produção.
TTL de todos os record sets baixado de 3600 → **300s**, para rollback
rápido pós-cutover (verificado depois que o `--set ttl` não apagou o
`targetResource` do alias nem nenhum valor de e-mail).

**Nameservers da zona nova** (para a troca no registro.br):
`ns1-04.azure-dns.com` · `ns2-04.azure-dns.net` ·
`ns3-04.azure-dns.org` · `ns4-04.azure-dns.info`

### A6.2 — Testes escritos ANTES do risco: CONCLUÍDA
- `scripts/mail-regression.mjs` + `.sh` — compara MX/SPF/autodiscover/
  DKIM/`_dmarc` ao vivo contra o snapshot nos dois domínios. Passando
  limpo. (Um falso positivo inicial foi corrigido: o snapshot grava
  "sem registro" como string de erro, o comparador tratava como valor.)
- `scripts/smoke.mjs` + `.sh` — cada URL de `url-contract.txt` em 200 no
  mesmo path; modo `--redirect` (para o Projeto B) exige 301 com path
  preservado. **Testado negativamente** (rodado em modo redirect contra
  o SWA, que devolve 200): acusou as 35 divergências e saiu com código
  1 — ou seja, o guardião realmente guarda, não é carimbo.

### A6.3 — Domínios customizados no SWA: AGUARDANDO AÇÃO DO USUÁRIO
Descoberta que definiu a ordem do cutover: o SWA devolve "site não
encontrado" para hostname que não reconhece. Trocar os NS antes de
registrar os domínios = **site fora do ar** até validar e emitir
certificado. Usuário optou por **zero downtime**: registrar e validar
com a UOL ainda servindo o site.

Os dois hostnames foram registrados com validação por TXT
(`--validation-method dns-txt-token`, aditiva). O risco anotado no
plano — de o Azure não aceitar TXT para subdomínio — **não se
concretizou**: `www` foi aceito igual ao apex. Estado atual: ambos em
`Validating`.

**CORREÇÃO (2026-08-16) — a primeira instrução estava errada.**
Pedi os TXT em `_dnsauth.<host>`, que é a convenção do Azure Front Door /
App Service, **não** do Static Web Apps. O usuário criou os dois
registros corretamente conforme instruí, mas no lugar errado — por isso
a validação ficou ~10h presa em `Validating`. Descoberto conferindo a
doc oficial em vez de continuar esperando o cache expirar.

O que o SWA realmente exige (ver tabela em CLAUDE.md):
- **apex** → TXT com host **`@`** (raiz), valor = token
- **`www`** → **CNAME**, não TXT. Não há validação por TXT para
  subdomínio.

Plano corrigido:
1. Usuário **acrescenta** na UOL um TXT em `@` com valor
   `_j7bvvp5zc2fbving8qnv2t1ov0ygvxc`. Acrescentar, nunca substituir —
   é a mesma raiz onde vivem os dois SPF. Múltiplos TXT na raiz são
   válidos (o domínio já tem dois hoje) e o SPF é lido pelo prefixo
   `v=spf1`, então o token não interfere.
2. Os dois `_dnsauth` criados antes ficam inertes; não precisa apagar
   (menos edição perto do SPF = menos risco). Somem sozinhos quando a
   zona migrar para o Azure.
3. Validação do apex depende só do TTL do RRset TXT que já existe
   (14400 na UOL) → até ~4h, normalmente menos. Sem o problema de cache
   negativo de 24h.
4. `www` **não** é pré-validado. O registro dele no SWA (feito com TXT)
   é inútil e será removido e refeito com `cname-delegation` **depois**
   da troca de NS, quando o Azure DNS já for autoritativo e o CNAME
   `www` → SWA já estiver no ar com TTL 300s. Valida em minutos.
   Custo: `www` fica alguns minutos fora do ar logo após o cutover — o
   apex, que é o canônico, não fica.

### A6.4+ — Pendente, nesta ordem
1. Usuário adiciona os 2 TXT na UOL → eu acompanho até os hostnames
   ficarem `Ready` (validação + certificado).
2. **Só então** usuário troca os NS no registro.br.
3. Eu rodo `mail-regression.sh` (tem que continuar verde) + `smoke.sh`
   nos dois hostnames + conferência visual no domínio real.
4. Usuário desinstala o WordPress da UOL (A6.6) e reenvia o
   `sitemap.xml` no Search Console (A6.7).
5. Portão A→B: **por evidência, não por calendário** — ver a revisão do
   portão na seção do Projeto B (decisão de 2026-08-16).

**Nota honesta sobre "TTL 300s 72h antes" do runbook:** essa regra vale
para a zona *antiga* (UOL), que não posso tocar. Aqui o risco real é bem
menor do que o runbook sugere: os registros de e-mail são idênticos nas
duas zonas, então distorção de propagação não pode quebrar e-mail; e
durante a janela, quem resolver pela UOL vê o WordPress (ainda no ar) e
quem resolver pelo Azure vê o site novo — os dois funcionam.

## Projeto B — Redirect tctelecom.com.br
Status: PENDENTE (depende do portão A→B, revisado abaixo)

### Portão A→B revisado (decisão do usuário, 2026-08-16)
O runbook original exigia **7 dias corridos** estáveis. Esse gate existia
para acumular evidência antes do **Projeto C** (migrar e-mail + cancelar a
UOL), que era a parte irreversível. Com o Projeto C fora de escopo
(ADR-003), o gate perdeu a finalidade — então **cai a espera de 7 dias**.

Substituído por **gate de evidência**: seguir para o Projeto B assim que o
cutover de `telecomtc.com.br` estiver comprovadamente verde —
`smoke.sh` 200 em todas as URLs nos dois hostnames, `mail-regression.sh`
sem divergência, certificado TLS válido, e envio/recebimento real
confirmado. Sem contagem de calendário.

### Cuidado que a mudança de gate NÃO remove
O risco do Projeto B **não é o site** — `tctelecom.com.br` não tem site
nenhum (confirmado 2026-08-16: HTTP 000 no apex e no www, sem registro A
no apex). O risco é que esse domínio carrega o **e-mail principal da
empresa** (MX → `tctelecom-com-br.mail.protection.outlook.com`, DNS
hospedado na Microsoft em `ns[1-4].bdm.microsoftonline.com`), e o
Projeto B move essa hospedagem de DNS para o Azure. Espelho errado =
e-mail principal quebrado. Isso é risco igual ou maior que o do Projeto A.

**DKIM confirmado na fonte de verdade (2026-08-16).** `Get-DkimSigningConfig
-Identity tctelecom.com.br` no Exchange Online devolveu `Enabled: True` e os
dois selectors, conferidos em três vias (Exchange × DNS ao vivo × snapshot) —
todos idênticos:
`selector{1,2}-tctelecom-com-br._domainkey.tcrepresentacao.a-v1.dkim.mail.microsoft`

O `Enabled: True` importa: o DKIM está assinando de verdade, então se os dois
CNAMEs quebrarem no cutover do Projeto B, o e-mail de saída do domínio
principal perde a assinatura e a entregabilidade cai (risco de cair em spam)
— sem erro visível. O espelho desses dois registros é load-bearing, não
decorativo.

Esperar dias não mitigava isso. O que mitiga:
- espelho verbatim do snapshot (MX, SPF, autodiscover, DKIM selector1 e
  selector2, `_dmarc`) — o `dns-snapshot-20260815.txt` já tem todos
- conferir a zona nova consultando os nameservers do Azure **direto**,
  antes de trocar o NS (mesmo método usado na A6.1)
- TTL 300s desde o início, para rollback rápido
- `mail-regression.sh` verde antes e depois + teste real de envio e
  recebimento em `@tctelecom.com.br`

### Simplificação que o "sem site" permite
Diferente do Projeto A, aqui **não é preciso o dance do `_dnsauth` antes
do cutover**. Como não existe site para derrubar, dá para trocar o NS
primeiro e registrar os domínios customizados no SWA depois — sair de
"não responde nada" para a página de not-found do Azure por alguns
minutos não é regressão. Isso evita justamente o problema de cache
negativo que travou a A6.

Critério de saída: 4 hostnames validados (2 em 200, 2 em 301 com path
preservado, via `smoke.sh --redirect`) + regressão de e-mail verde nos
dois domínios.

## Projeto C — E-mail + cancelamento da UOL
Status: FORA DE ESCOPO — não será executado (ver ADR-003, decisão de
2026-08-15). UOL permanece ativa indefinidamente como provedora de
e-mail de @telecomtc.com.br.

## A6.1-bis — Espelho REFEITO a partir do arquivo de zona (2026-08-16)
Status: CONCLUÍDA

**Falha grave encontrada a pedido do usuário ("seja criterioso"), antes da
troca de NS.** O espelho anterior tinha **7 de 38** registros e passou por
"verbatim". Causa raiz: `dns-snapshot.mjs` consulta uma **lista fixa de nomes
que eu imaginei** — e DNS não permite listar uma zona, então ele jamais
descobriria um registro cujo nome eu não adivinhasse. Pior: o
`mail-regression.sh` conferia exatamente os mesmos campos, então **os dois
testes concordavam entre si e eram cegos para o mesmo ponto**.

Fonte de verdade real: `dnszones/telecomtc.com.br.db` dentro do backup do
cPanel — o arquivo de zona, que lista tudo.

**O que teria quebrado na virada (31 registros ausentes):**
- `pro._domainkey` (DKIM do e-mail UOL) e `s1`/`s2._domainkey` (DKIM SendGrid)
  → e-mail sairia **sem assinatura**, degradando entregabilidade sem erro visível
- 5 registros SRV (`_autodiscover`, `_imap`, `_pop3`, `_smtp`, `_submission`)
  → autoconfiguração de clientes de e-mail
- `mail`/`smtp`/`pop`/`pop3`/`imap`/`webmail` estavam como **A com IP fixo**;
  na UOL são **CNAME**. Funcionaria hoje e quebraria quando a UOL trocasse de IP
- `correio` ausente por completo
- `cpanel`/`whm`/`webdisk`/`ftp`/`cpcontacts`/`cpcalendars` → acesso administrativo
- `ofertas`/`lp` (landing pages RD Station, **em uso**) e 6 CNAMEs SendGrid
  (`emailmkt`/`comercial`/`click*`/IDs numéricos) → marketing fora do ar

**Correção:** `scripts/mirror-zone.mjs` — reconciliador que deriva o espelho do
arquivo de zona, faz diff contra o estado real do Azure e **gera** os comandos
(não executa), para o plano ser revisado antes de aplicar. Idempotente: rodar de
novo só mostra o que ainda falta. Zona hoje: **40 record sets, diff zero**.

**Dois bugs do próprio verificador, achados e corrigidos no processo:**
- lia `SrvRecords`; o Azure devolve `SRVRecords` → reportava os 5 SRV como
  ausentes quando existiam
- checagem de `webmail` com fallback A→CNAME mal feito → falso negativo

Lição para o Projeto B: **não confiar em snapshot por consulta.** Para
`tctelecom.com.br` o DNS está na Microsoft, então é preciso exportar a zona pelo
portal/Graph antes de espelhar — senão o mesmo erro se repete, e lá o e-mail é
o principal da empresa.

## VIRADA CONCLUÍDA — site no ar em tctelecom.com.br (2026-08-16)
Status: CONCLUÍDA ✅

O cutover de `telecomtc.com.br` travou por **impasse administrativo**: o
registro.br mostra UOLHOST como Provedor de Serviços (e nessa condição só
permite visualização), enquanto o painel da UOL classifica o domínio como
"externo" e diz não conseguir alterar os servidores DNS. Destravar exigiria
mudar o provedor para NENHUM — mudança administrativa que o usuário optou,
com razão, por não fazer sem certeza.

**Solução:** publicar em `tctelecom.com.br`, que não tem provedor (titular
administra direto) e cujo DNS na Microsoft aceita A e CNAME customizados.
O site foi apontado **sem migrar zona** e **sem tocar em e-mail** — só 2
registros de site. Ver `docs/ADR-004`.

### O que foi feito
- `SITE_URL` → `https://tctelecom.com.br` (uma linha; o e-mail de contato
  `comercial@telecomtc.com.br` **não** mudou — é o endereço real).
- Liberados os 2 slots de domínio do SWA Free (removidos os de telecomtc,
  validados mas nunca live) e registrados os dois novos.
- Usuário criou 2 TXT de validação no M365 (raiz + `_dnsauth.www`), depois
  o A do apex (`40.67.153.174`) e o CNAME do `www`.

### Verificação (tudo ao vivo, no domínio real)
| Item | Resultado |
|---|---|
| `mail-regression.sh` | verde — MX, SPF, mscid, DKIM ×2, autodiscover, `_dmarc` intactos |
| `smoke.sh` nos 2 hostnames | **70/70** checagens em 200 |
| HTTPS apex | 200, cert `CN=tctelecom.com.br` |
| HTTPS www | 200, cert `CN=www.tctelecom.com.br` |
| Canonical/sitemap/robots | `tctelecom.com.br` |
| Conferência visual (4 páginas) | idêntica ao original, sem erro de console |

### Correção de documentação
Eu havia registrado que "não existe validação por TXT para subdomínio no
SWA" (a doc pública da Microsoft só documenta CNAME). **É falso** — o
`dns-txt-token` funcionou para `www` nos dois domínios. Isso permite
pré-validar o `www` sem derrubá-lo, que é o que tornou esta virada
zero-downtime. Corrigido em `CLAUDE.md`.

### Pendências
- **Destino de `telecomtc.com.br`** — hoje ainda serve o WordPress antigo na
  UOL, gerando conteúdo duplicado. Usuário decide depois. A zona espelho no
  Azure DNS continua pronta (38 registros, diff zero) caso o impasse do
  provedor seja resolvido.
- **Teste real de e-mail** em `@tctelecom.com.br` — enviar e receber de fora
  (Gmail). Teste sintético não prova entrega.
- **Trade-off aceito:** o apex vai por registro A (o DNS da Microsoft não
  tem ALIAS), então é servido de uma única região. O `www` mantém a
  distribuição global do SWA.
