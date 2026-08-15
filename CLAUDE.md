# TC Telecom — site institucional

## Estado final (escopo atual)
Site sai da UOL e vai para o Azure. E-mail NÃO faz parte deste projeto.

4 hostnames -> site no Azure:
  telecomtc.com.br + www  -> 200 (site real, canônico)
  tctelecom.com.br + www  -> 301 -> telecomtc.com.br

DNS de ambos os domínios -> Azure DNS (zonas espelho verbatim, incluindo
os registros de e-mail de cada domínio).

E-mail — permanece exatamente onde está, para sempre, neste projeto:
  @telecomtc.com.br -> UOL (mx.uhserver.com) — INTOCADO
  @tctelecom.com.br -> Exchange Online — INTOCADO

UOLHost: NÃO é cancelada. Plano é REDUZIDO — perde site (WordPress) e DNS
de telecomtc.com.br, mantém e-mail @telecomtc.com.br indefinidamente.

## Fora de escopo (decidido em 2026-08-15)
Projeto C do runbook original (onboarding de @telecomtc.com.br no M365,
cutover de MX, cancelamento da UOL) NÃO será executado. Ver docs/ADR-003.

## Ordem (não inverter)
A. Site -> Azure, servindo telecomtc.com.br. Estabilizar 7 dias.
B. Redirect de tctelecom.com.br -> telecomtc.com.br. Validar os 4
   hostnames. Zona tctelecom.com.br migra para Azure DNS — e-mail dela
   (Exchange Online) é só espelhado verbatim, nada muda ali.

## Invioláveis
- MX de telecomtc.com.br NUNCA muda — email fica na UOL indefinidamente,
  fora de escopo.
- Durante A e B: NENHUM registro de e-mail muda em nenhuma das duas
  zonas. Zonas novas são espelho verbatim do snapshot.
- public/wp-content/uploads/ é somente leitura. Novos assets em
  public/assets/.
- redirect/staticwebapp.config.json é GERADO. Não editar à mão.
- Toda URL pública nova entra em url-contract.txt no mesmo commit.
- Build abaixo de 200 MB e 12.000 arquivos (quota Free: 250 MB / 15.000).
- Nenhum secret ou token entra no repositório. Vão para GitHub Secrets.

## Paradas obrigatórias — nunca executar, devolver o controle
- Qualquer operação sobre MX, SPF, autodiscover, DKIM ou _dmarc em
  qualquer zona.
- Qualquer alteração de nameservers no registro.br.
- Qualquer ação no Microsoft 365 Admin Center / Exchange Admin Center.
- Qualquer ação no painel da UOLHost.
- az group delete / az staticwebapp delete / az network dns zone delete
  / qualquer delete sobre recurso existente.
- Apagar ou modificar arquivos sob public/wp-content/uploads/.

## Convenção de nomes — usar exatamente
| Item | Valor |
|---|---|
| Resource Group | `rg-tctelecom` |
| Região | `eastus2` (SWA não existe em `brazilsouth`) |
| SWA do site | `swa-telecomtc-site` |
| SWA do redirect | `swa-tctelecom-redirect` |
| Repositório | `azrhaell/telecomtc-site` |
| Domínio canônico | `https://telecomtc.com.br` (apex, sem www) |

## Ambiente (validado em 2026-08-15)
- Windows, PowerShell + Git Bash. wget e dig NÃO instalados — substituídos
  por scripts Node.js (`scripts/mirror-gate.mjs` usa `fetch`/`fs` no lugar
  de wget; `scripts/dns-snapshot.mjs` usa `node:dns/promises` no lugar de
  dig). Rodam via `node scripts/*.mjs`, sem dependências externas.
- Node 24.16 local; workflows do GitHub Actions fixam Node 22 conforme
  runbook.
- Azure CLI autenticado: subscription "Azure subscription 1", tenant
  azrhaell700hotmail.onmicrosoft.com — bate com a convenção de nomes
  (azrhaell/telecomtc-site).
- gh CLI não instalado. Repositório GitHub azrhaell/telecomtc-site ainda
  NÃO existe (checado em 2026-08-15) — criar antes da Fase A5.
- Estado DNS/HTTP confirmado ao vivo em 2026-08-15: telecomtc.com.br em
  NS/MX da UOL, servindo WordPress/PHP 7.4.33 (200 ao vivo);
  tctelecom.com.br em NS da Microsoft, MX Exchange Online, sem site.
- Anomalias existentes a MIRROR, não corrigir: telecomtc.com.br tem dois
  TXT SPF e dois TXT _dmarc (um malformado, "v=DMARC1" sem policy).
  Espelhar verbatim na Fase A1.3/A6.1 — não consolidar nem "limpar".
- Site é construído com Elementor + Elementor Pro (page builder), não
  Gutenberg/editor clássico — conteúdo real é só 4 páginas (`/`,
  `/empresa/`, `/fale-conosco/`, `/servicos/`), 6,7 MB total, 89 arquivos
  no crawl. Elementor guarda o conteúdo em JSON serializado, não HTML
  limpo — `wordpress-export-to-markdown` (A2.1) provavelmente não vai
  converter bem; com só 4 páginas, recriar manualmente como
  componentes/Markdown no Next.js tende a ser mais rápido que brigar com
  conversão automática. Reavaliar quando o WXR chegar.
- `url-contract.txt` é curado, não um dump cru do crawl: só páginas de
  conteúdo + mídia enviada (`wp-content/uploads/AAAA/MM/**`). Ativos de
  implementação do WP/Elementor (plugins, tema, wp-includes, CSS
  auto-gerado do Elementor por post em `wp-content/uploads/elementor/`)
  ficam em `mirror-crawl-full.txt`, fora do contrato — eles não vão
  existir no site Next.js, então não fazem sentido no smoke test (A6.4)
  nem no gerador de redirect (B2).
- Backup completo da conta cPanel da UOL recebido e analisado em
  2026-08-15 (satisfaz A1.4 — ver PLAN.md para achados completos).
  Extraído fora do repo/OneDrive, nunca commitado (tem credenciais de
  banco e dados de e-mail). `/oferta-sms/` e `/sample-page/` existem no
  banco mas foram descartados por decisão do usuário — não migram.

## Stack real (Fase A3, 2026-08-15)
- **Next.js 16.3.1**, não 15 como o runbook original assumia — era a
  versão atual no momento da execução (`create-next-app@latest`).
  Diferença que importa: `src/app/sitemap.ts` e `robots.ts` exigem
  `export const dynamic = 'force-static'` com `output: 'export'`,
  senão o build falha. `LayoutProps<'/'>` é o tipo novo pros props do
  root layout.
- Tailwind v4 (CSS-first, `@import 'tailwindcss'` em globals.css, sem
  `tailwind.config.js`).
- Scaffold gerado numa pasta temporária (`create-next-app` recusa
  diretório não-vazio) e mesclado no repo — não usar
  `--login-with-github` nem tentar rodar `create-next-app` direto na
  raiz do projeto de novo.
- Os 3 scripts de rastreamento globais (decisão do usuário 2026-08-15)
  estão em `src/app/layout.tsx`: meta tag de verificação do Facebook
  Business, loader do RD Station, Google tag (gtag.js, measurement ID
  G-0FFBNFM94W).
- Formulários (`ContactForm.tsx`, `JobApplicationForm.tsx`) usam
  Web3Forms via `NEXT_PUBLIC_WEB3FORMS_KEY`. **Ação pendente do
  usuário**: criar conta em web3forms.com e preencher essa env var
  (`.env.example` documenta) — sem ela os formulários não enviam.
- `eslint.config.mjs` ignora `mirror-uol/**` — sem isso o ESLint lintava
  o JS de terceiros (jQuery, Elementor) baixado no crawl da Fase A1 e
  gerava milhares de falsos positivos.

## Documentos de origem
Os planos originais (com escopo mais amplo, incluindo o Projeto C que
está fora de escopo aqui) estão em `docs/source/` para referência
histórica. O CLAUDE.md e o PLAN.md deste repositório são a fonte de
verdade atual — prevalecem sobre os documentos de origem sempre que
houver conflito.

## Comandos
npm run build                    # gera ./out
npx linkinator ./out --recurse   # gate de links
bash scripts/smoke.sh            # 4 hostnames
bash scripts/mail-regression.sh  # e-mail vs snapshot
