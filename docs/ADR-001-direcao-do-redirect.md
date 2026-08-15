# ADR-001 — Direção do redirect entre os dois domínios

## Status
Aceita (2026-08-15)

## Contexto
O projeto envolve dois domínios: `telecomtc.com.br` e `tctelecom.com.br`.
Durante o planejamento (documentos de origem em `docs/source/`), a
direção do redirect entre eles mudou de posição várias vezes. Esta ADR
existe para travar a decisão de uma vez por todas e evitar que ela volte
a oscilar em sessões futuras.

## Decisão
- `telecomtc.com.br` é o **domínio canônico**. Serve o site real
  (Next.js SSG), responde `200` no apex e no `www`.
- `tctelecom.com.br` **redireciona** (`301`) para `telecomtc.com.br`,
  preservando o path. Responde `301` no apex e no `www`.

Não há Change of Address nem transferência de autoridade de SEO — o
conteúdo real nunca existiu em `tctelecom.com.br` (ele nunca serviu
site, apenas e-mail), então o redirect é higiene de tráfego (links
digitados, material impresso), não defesa de posicionamento.

## Consequência
Dois Static Web Apps são necessários (`swa-telecomtc-site` e
`swa-tctelecom-redirect`), porque o tier Free do Azure Static Web Apps
permite só 2 domínios customizados por app — exatamente apex + `www` de
cada domínio. Ver Projeto A e Projeto B em `PLAN.md`.
