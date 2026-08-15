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
- Windows, PowerShell + Git Bash. wget e dig NÃO instalados — usar curl +
  Node.js para mirror/crawl (Fase A1), e Resolve-DnsName do PowerShell no
  lugar de dig.
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
