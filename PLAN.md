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

## Próximo passo: Fase A2 — Extração para Next.js
Conteúdo-fonte confirmado: 3 páginas internas (`empresa`, `fale-conosco`,
`servicos`) + home, extraídas do HTML renderizado já capturado em
`mirror-uol/` (mais confiável que tentar converter o JSON serializado do
Elementor automaticamente — ver CLAUDE.md > Ambiente). Ainda não
iniciado.

## Projeto B — Redirect tctelecom.com.br
Status: PENDENTE (depende do portão A→B)

Critério de saída: 4 hostnames validados + regressão de e-mail verde nos
dois domínios.

## Projeto C — E-mail + cancelamento da UOL
Status: FORA DE ESCOPO — não será executado (ver ADR-003, decisão de
2026-08-15). UOL permanece ativa indefinidamente como provedora de
e-mail de @telecomtc.com.br.
