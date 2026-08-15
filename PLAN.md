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
- [ ] A1.4 Backups — **bloqueado, ação do usuário**:
      - Export WXR do WordPress (wp-admin → Ferramentas → Exportar →
        Todo o conteúdo) — necessário para Fase A2 (extração).
        **Atenção**: o site usa Elementor/Elementor Pro, não
        Gutenberg — o conteúdo vem serializado em JSON, não HTML
        limpo. Com só 4 páginas, recriação manual em Next.js pode ser
        mais rápida que depender de conversão automática
        (wordpress-export-to-markdown). Reavaliar quando o WXR
        chegar.
      - Backup de arquivos + dump MySQL da UOL (segurança geral,
        independente do e-mail).
      - Export IMAP das caixas `@telecomtc.com.br`: deixou de ser P0
        bloqueante (ADR-003 — UOL não será cancelada), mas continua
        sendo boa prática de backup, por conta do usuário.

Critério de saída (portão A→B): site 200 nos dois hostnames + smoke
verde + regressão de e-mail sem divergência + 7 dias corridos estável +
WordPress desinstalado da UOL.

## Projeto B — Redirect tctelecom.com.br
Status: PENDENTE (depende do portão A→B)

Critério de saída: 4 hostnames validados + regressão de e-mail verde nos
dois domínios.

## Projeto C — E-mail + cancelamento da UOL
Status: FORA DE ESCOPO — não será executado (ver ADR-003, decisão de
2026-08-15). UOL permanece ativa indefinidamente como provedora de
e-mail de @telecomtc.com.br.
