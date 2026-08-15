# PROMPT DE BOOTSTRAP — Consolidação TC Telecom no Azure + Microsoft 365

> **Como usar:** cole o bloco entre `---INÍCIO---` e `---FIM---` numa sessão nova do Claude Code no VS Code, dentro da pasta vazia do projeto. Uma única vez; depois use o comando de retomada no final.
>
> **Antes de colar, leia o bloqueador na primeira seção.** Há uma contradição na especificação que precisa ser resolvida por você, não pelo agente.

---INÍCIO---

Você vai me ajudar a consolidar toda a presença digital da TC Telecom no Azure e no Microsoft 365, saindo por completo da UOLHost. Leia todo este briefing antes de executar qualquer coisa.

## ⛔ BLOQUEADOR P0 — resolver antes de qualquer execução

Minha especificação tem duas exigências que não coexistem como escritas:

- "não vou migrar os e-mails do domínio telecomtc.com.br"
- "cancelar tudo da UOL de vez"

As caixas `@telecomtc.com.br` estão na UOL. Cancelar a UOL sem mover o serviço de e-mail **destrói essas caixas irreversivelmente**.

**Leitura adotada:** "não migrar os e-mails" = **não transferir o conteúdo histórico das caixas**. O *serviço* de e-mail é onboardado no Microsoft 365 para que os endereços continuem existindo. É isso que torna "mesma administração M365" e "cancelar a UOL" compatíveis.

Na Fase 0 você vai me pedir para confirmar essa leitura e decidir, endereço por endereço:

| Opção | O que acontece | Custo |
|---|---|---|
| **1** | Endereço vira **alias** de uma caixa M365 já licenciada | **R$ 0** |
| **2** | Caixa nova licenciada, com login próprio | ~US$ 4/caixa/mês |
| **3** | Endereço deixa de existir (mensagens passam a retornar erro) | R$ 0 |

**Em qualquer opção, inclusive a 3:** export IMAP de todas as caixas antes do cancelamento. É a única defesa contra a única ação deste projeto que não tem rollback.

## ESTADO FINAL DESEJADO

| Hostname | Resposta | Servido por |
|---|---|---|
| `telecomtc.com.br` | **200** — site | `swa-telecomtc-site` (alias A no apex) |
| `www.telecomtc.com.br` | **200** — site | `swa-telecomtc-site` (CNAME) |
| `tctelecom.com.br` | **301** → telecomtc.com.br | `swa-tctelecom-redirect` (alias A no apex) |
| `www.tctelecom.com.br` | **301** → telecomtc.com.br | `swa-tctelecom-redirect` (CNAME) |

| Componente | Antes | Depois |
|---|---|---|
| Site | WordPress/PHP na UOL | Next.js SSG em Azure Static Web Apps |
| DNS `telecomtc.com.br` | UOL | **Azure DNS** |
| DNS `tctelecom.com.br` | Gerenciado pela Microsoft (M365) | **Azure DNS** |
| E-mail `@tctelecom.com.br` | Exchange Online | Exchange Online — **inalterado** |
| E-mail `@telecomtc.com.br` | UOL | Exchange Online (mesmo tenant) |
| UOLHost | site + e-mail + DNS | **Cancelada** |

**São necessários dois Static Web Apps** porque o tier Free permite apenas 2 domínios customizados por app — exatamente apex + www de cada domínio.

## POR QUE AZURE DNS E NÃO O DNS DO M365

O DNS gerenciado pelo Microsoft 365 **não suporta ALIAS/ANAME no apex** — aceita `A` e `CNAME` customizados, mas o apex exigiria um `A` com IP fixo, e o Static Web Apps não tem IP garantido. Apoiar o site principal num IP que a Microsoft documenta como contorno é risco de indisponibilidade no ativo mais importante.

Azure DNS continua sendo Microsoft, continua sendo um lugar só, e entrega o primitivo correto (*alias record* no apex). Custo: ~US$ 1/mês pelas duas zonas.

**Efeito colateral positivo:** mover a zona de `telecomtc.com.br` para o Azure DNS **antes** do cutover de e-mail torna a migração de e-mail mais segura — a troca de MX vira a edição de um registro no portal Azure, com rollback em segundos, em vez de mudança no painel da UOL.

## CONVENÇÃO DE NOMES — use exatamente

| Item | Valor |
|---|---|
| Resource Group | `rg-tctelecom` |
| Região | `eastus2` (SWA não existe em `brazilsouth`) |
| SWA do site | `swa-telecomtc-site` |
| SWA do redirect | `swa-tctelecom-redirect` |
| Repositório | `azrhaell/telecomtc-site` |
| Domínio canônico | `https://telecomtc.com.br` (apex, sem www) |

**Stack:** Next.js 15 (App Router, TypeScript, Tailwind) com `output: 'export'`. Node 22. Conteúdo em Markdown versionado. Sem VM, sem banco, sem App Service.

---

## INVIOLÁVEIS

1. **Durante os Projetos A e B, nenhum registro de e-mail muda.** As zonas novas são espelho verbatim do snapshot. Diff em MX, SPF, autodiscover, DKIM ou `_dmarc` é falha, nunca melhoria ou limpeza.
2. `public/wp-content/uploads/` é **namespace congelado, somente leitura**. Novos assets em `public/assets/`.
3. `redirect/staticwebapp.config.json` é **gerado** por script. Nunca editar à mão.
4. Toda URL pública nova entra em `url-contract.txt` no mesmo commit.
5. Build abaixo de **200 MB e 12.000 arquivos** (quota SWA Free: 250 MB por environment, 15.000 arquivos).
6. Nenhum secret ou token entra no repositório. Vão para GitHub Secrets.
7. Não avançar de fase sem o critério de aceite da anterior verde.

## PARADAS OBRIGATÓRIAS — nunca execute, me devolva o controle

- ❌ Qualquer operação sobre **MX, SPF (TXT), autodiscover, DKIM (selector1/selector2) ou `_dmarc`**, em qualquer zona.
- ❌ Qualquer alteração de **nameservers no registro.br**.
- ❌ Qualquer ação no **Microsoft 365 Admin Center** ou **Exchange Admin Center**.
- ❌ Qualquer ação no **painel da UOLHost** — e em especial **o cancelamento do plano**.
- ❌ `az group delete`, `az staticwebapp delete`, `az network dns zone delete`, ou qualquer `delete` sobre recurso existente.
- ❌ Apagar ou modificar arquivos sob `public/wp-content/uploads/`.

**Comportamento em falha:** gate de quota reprovado é motivo de **parar e reportar**. Não contorne apagando mídia, não suba para tier pago por conta própria.

---

## SEQUENCIAMENTO — três projetos, risco crescente

Tudo que é reversível acontece primeiro; a única ação sem rollback fica por último, depois de tudo provado em produção.

| | Projeto | Reversibilidade | Portão de saída |
|---|---|---|---|
| **A** | Site para o Azure, servindo `telecomtc.com.br` | Total | Site 200 nos dois hostnames + smoke verde + **7 dias** estável |
| **B** | Redirect de `tctelecom.com.br` | Total | 4 hostnames validados + regressão de e-mail verde |
| **C** | E-mail `@telecomtc` → M365 e desligamento da UOL | **Parcial, depois nenhuma** | Entrega bidirecional confirmada + **14 dias** de observação |

> **Pontos de não-retorno.**
> **C4 (cutover de MX)** — assim que mensagens chegarem no M365, voltar o MX para a UOL espalha correspondência entre dois sistemas. Reversível só nas primeiras horas, sempre com perda.
> **C6 (cancelamento da UOL)** — irreversível, sem exceção. Só com export IMAP conferido, 14 dias estáveis e os 4 hostnames corretos.

---

## FASE 0 — Bootstrap (agora)

**0.1 Eco de entendimento.** Antes de qualquer comando, me devolva em no máximo 20 linhas: os 4 hostnames e o que cada um responde, qual domínio é canônico, por que as zonas vão para o Azure DNS e não para o DNS do M365, a ordem dos três projetos, quais são os dois pontos de não-retorno, e o que exatamente precisa estar pronto antes de cancelar a UOL. **Pergunte-me a resolução do bloqueador P0** (a leitura sobre "não migrar os e-mails" e a decisão da árvore por endereço). Só prossiga depois que eu confirmar.

> A direção do redirect mudou várias vezes durante o planejamento. Este eco existe para travá-la: **site em `telecomtc.com.br`; `tctelecom.com.br` redireciona para ele.**

**0.2** Crie `CLAUDE.md` com estado final, ordem dos projetos, irreversíveis, invioláveis e comandos.

**0.3** Crie `PLAN.md` com as fases e o estado de cada uma (`PENDENTE`/`EM ANDAMENTO`/`CONCLUÍDA` + data). **Atualize ao final de cada fase.**

**0.4** Crie `docs/ADR-001-direcao-do-redirect.md` e `docs/ADR-002-azure-dns-vs-m365-dns.md` registrando as duas decisões e seus motivos.

**0.5** `git init` + `.gitignore` (Node, Next.js, `.env*`, `out/`, `.azure/`).

**Aceite:** os arquivos existem, o eco foi confirmado e o bloqueador P0 está resolvido por escrito no `PLAN.md`.

---

# PROJETO A — Site no Azure

## FASE A1 — Gates, inventário e backups

**A1.1 Gate de viabilidade — bloqueante:**

```bash
wget --mirror --convert-links --page-requisites --no-parent \
  -P ./mirror-uol https://telecomtc.com.br

du -sh ./mirror-uol                     # alvo: < 200 MB
find ./mirror-uol -type f | wc -l       # alvo: < 12.000
du -sh ./mirror-uol/wp-content/uploads
```

Reprovando: **pare e me reporte.**

**A1.2 Contrato de URLs.** O site não muda de domínio — este é um **contrato de identidade**: cada URL deve responder 200 no mesmo path, antes e depois.

```bash
wget --spider -r -l inf --no-verbose https://telecomtc.com.br 2>&1 \
  | grep -Eo 'https://telecomtc\.com\.br[^ ]*' | sort -u > url-contract.txt
```

**A1.3 Snapshot de DNS — contrato de imutabilidade das duas zonas:**

```bash
for D in telecomtc.com.br tctelecom.com.br; do
  echo "===== $D ====="
  dig NS $D +short; dig MX $D +short; dig TXT $D +short
  dig A $D +short; dig CNAME www.$D +short
  dig CNAME autodiscover.$D +short
  dig CNAME selector1._domainkey.$D +short
  dig CNAME selector2._domainkey.$D +short
  dig TXT _dmarc.$D +short
done | tee dns-snapshot-$(date +%Y%m%d).txt

# O setup da UOL não é padronizado como o do M365:
for H in mail webmail smtp pop imap pop3 smtps; do
  echo -n "$H.telecomtc.com.br -> "; dig +short $H.telecomtc.com.br
done
```

Commite. Peça-me para confirmar o DKIM de `tctelecom.com.br` via `Get-DkimSigningConfig` no Exchange Online PowerShell.

**A1.4 Backups — P0.** Me lembre e acompanhe:
- **Export IMAP de todas as caixas `@telecomtc.com.br`** (Thunderbird ou `imapsync`) — sem isso, o Projeto C não começa.
- Backup UOL (arquivos + dump MySQL) e export WXR validado.
- Inventário das caixas: quantidade, uso real, tamanho, aliases, encaminhamentos → alimenta a árvore de decisão.
- Plugins WordPress ativos sem equivalente estático (busca, galeria, slider, formulário).

**Aceite:** gate aprovado, `url-contract.txt` e `dns-snapshot-*.txt` commitados, export IMAP confirmado por mim.

## FASE A2 — Extração para Markdown

**A2.1** Eu exporto o WXR (wp-admin → Ferramentas → Exportar → Todo o conteúdo). Você converte:

```bash
npx wordpress-export-to-markdown \
  --input export.xml --output content \
  --post-folders false --prefix-date false --save-images all
```

Fallback se o WXR vier malformado: REST API (`/wp-json/wp/v2/pages` e `/posts`) com `turndown`.

**A2.2** Mova a mídia para `public/wp-content/uploads/` **preservando os paths originais**.

**A2.3** Confira que cada slug bate com `url-contract.txt`. Divergência é erro de migração — me reporte a lista.

## FASE A3 — Next.js

Scaffold com `create-next-app` (TypeScript, Tailwind, App Router, `--src-dir`).

**A3.1** `next.config.ts`:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

**A3.2** Canonicalização em `src/app/layout.tsx` — o SWA não suporta redirect por hostname, então apex e `www` servem ambos 200:

```ts
export const metadata = {
  metadataBase: new URL('https://telecomtc.com.br'),
  alternates: { canonical: './' },
};
```

**A3.3** Páginas dinâmicas via `generateStaticParams`. **Next 15: `params` é `Promise`:**

```tsx
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

**A3.4** `sitemap.ts` e `robots.ts` nativos.

**A3.5** Otimização de imagens em prebuild (`sharp` → WebP) sobre `wp-content/uploads`. **Gere arquivos novos, não sobrescreva os originais.**

**A3.6** Formulário: Web3Forms ou Managed Function em `api/`.

**Aceite:** `npm run build` gera `./out` sem erro, `npx serve out` serve o site, `du -sh out` sob os limiares.

## FASE A4 — Configuração do SWA

`staticwebapp.config.json` — literalmente assim. `trailingSlash: "always"` casa com o Next e evita 301 em cadeia; `form-action`/`connect-src` são obrigatórios ou a CSP bloqueia o formulário silenciosamente em produção:

```json
{
  "trailingSlash": "always",
  "routes": [
    { "route": "/wp-login.php", "statusCode": 404 },
    { "route": "/wp-admin/*",   "statusCode": 404 },
    { "route": "/xmlrpc.php",   "statusCode": 404 },
    { "route": "/index.php", "redirect": "/", "statusCode": 301 }
  ],
  "responseOverrides": { "404": { "rewrite": "/404.html" } },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; form-action 'self' https://api.web3forms.com; connect-src 'self' https://api.web3forms.com; frame-ancestors 'none'; base-uri 'self'"
  }
}
```

## FASE A5 — Provisionar e publicar

```bash
az group create -n rg-tctelecom -l eastus2
az staticwebapp create -n swa-telecomtc-site -g rg-tctelecom -l eastus2 --sku Free
az network dns zone create -g rg-tctelecom -n telecomtc.com.br
az staticwebapp secrets list -n swa-telecomtc-site -g rg-tctelecom --query "properties.apiKey" -o tsv
```

**Não use `--login-with-github`** — exige device flow interativo e trava execução por agente. Me passe o token para eu gravar como secret `AZURE_SWA_TOKEN_SITE`.

Workflow `azure-swa-site.yml`: `paths-ignore: ['redirect/**','*.md']`, `app_location: "/"`, `api_location: "api"`, `output_location: "out"`, Node 22.

**Aceite:** o site funciona integralmente pela URL `*.azurestaticapps.net`, com a produção ainda na UOL.

## FASE A6 — Zona, cutover e validação

**A6.1** Popular a zona `telecomtc.com.br` no Azure DNS como **espelho verbatim do snapshot — incluindo os registros de e-mail da UOL**. O e-mail continua na UOL e continua funcionando. Adicionar apenas: alias A no apex e CNAME `www` → `swa-telecomtc-site`.

**A6.2** Escreva `scripts/mail-regression.sh` **antes** de qualquer mudança de DNS — o teste precisa existir antes do risco. Compara os registros atuais contra o snapshot; qualquer divergência é falha.

**A6.3** Validar os domínios customizados no SWA. TTL 300s 72h antes. **Eu troco os NS no registro.br.**

**A6.4** `scripts/smoke.sh` — para o site, o esperado é **200**, não 301:

```bash
for HOST in telecomtc.com.br www.telecomtc.com.br; do
  while read -r u; do
    path=$(echo "$u" | sed -E 's#https?://[^/]+##')
    code=$(curl -s -o /dev/null -w '%{http_code}' "https://${HOST}${path}")
    [[ "$code" == "200" ]] || echo "REGRESSAO $HOST$path -> $code"
  done < url-contract.txt
done
```

Um 301 aqui indica `trailingSlash` divergente ou slug alterado na extração.

**A6.5** Regressão de e-mail — nada pode ter mudado:

```bash
dig MX telecomtc.com.br +short   # DEVE seguir apontando para a UOL
dig MX tctelecom.com.br +short   # DEVE seguir *.mail.protection.outlook.com
```

Mais envio e recebimento reais nos dois domínios, com `spf=pass` e `dkim=pass` no cabeçalho.

**A6.6** Me lembre de **desinstalar o WordPress da UOL**. O plano ainda existe pelo e-mail, mas a instalação PHP sai de cena agora.

**A6.7** Reenviar o `sitemap.xml` no Search Console. Não há Change of Address — o domínio não mudou.

---

# PORTÃO A → B

- [ ] `telecomtc.com.br` e `www.telecomtc.com.br` respondem 200 com certificado válido
- [ ] `smoke.sh` exit 0 — toda URL do contrato responde 200 no mesmo path
- [ ] Regressão de e-mail sem divergência nos dois domínios
- [ ] Envio e recebimento reais confirmados
- [ ] **7 dias corridos** de estabilidade após a troca de NS
- [ ] WordPress desinstalado da UOL

---

# PROJETO B — Redirect de tctelecom.com.br

**B1** Zona `tctelecom.com.br` no Azure DNS: espelho verbatim dos registros do M365 (MX, SPF, autodiscover, DKIM selector1/selector2, `_dmarc`). TTL 300s 72h antes. **Eu troco os NS.**

**B2** Gerador `scripts/gen-redirect-config.mjs`. O SWA não suporta capture group no destino, então gera-se uma rota por path:

```js
import fs from 'node:fs';

const DEST = 'https://telecomtc.com.br';
const urls = fs.readFileSync('url-contract.txt', 'utf8')
  .split('\n').map(s => s.trim()).filter(Boolean);

const routes = [...new Set(
  urls.map(u => new URL(u).pathname).filter(p => p !== '/')
)].sort().map(path => ({ route: path, redirect: DEST + path, statusCode: 301 }));

routes.push({ route: '/*', redirect: DEST, statusCode: 301 }); // sempre por último

fs.mkdirSync('redirect', { recursive: true });
fs.writeFileSync('redirect/staticwebapp.config.json',
  JSON.stringify({ trailingSlash: 'always', routes }, null, 2));
```

Crie também `redirect/index.html` como placeholder.

**B3** Segundo SWA e workflow:

```bash
az staticwebapp create -n swa-tctelecom-redirect -g rg-tctelecom -l eastus2 --sku Free
```

Workflow `azure-swa-redirect.yml`: `paths: ['redirect/**','url-contract.txt','scripts/gen-redirect-config.mjs']`, roda o gerador antes do deploy, `app_location: "redirect"`, `output_location: "."`, `skip_app_build: true`.

**B4** Alias A no apex + CNAME `www` → `swa-tctelecom-redirect`, na zona Azure DNS.

**B5** Smoke dos quatro hostnames. Para os dois de redirect, **sempre 301 com path preservado** — um 200 ali indica conteúdo duplicado:

```bash
for HOST in tctelecom.com.br www.tctelecom.com.br; do
  while read -r u; do
    path=$(echo "$u" | sed -E 's#https?://[^/]+##')
    code=$(curl -s -o /dev/null -w '%{http_code}' "https://${HOST}${path}")
    [[ "$code" == "301" ]] || echo "FALHA $HOST$path -> $code"
    loc=$(curl -s -o /dev/null -w '%{redirect_url}' "https://${HOST}${path}")
    [[ "$loc" == "https://telecomtc.com.br${path}" ]] || echo "AVISO path perdido: $HOST$path"
  done < url-contract.txt
done
```

**B6** Regressão de e-mail nos dois domínios. **Ainda nada pode ter mudado.**

---

# PROJETO C — E-mail e desligamento da UOL

> **A partir daqui as ações deixam de ser reversíveis.** Você orienta; eu executo tudo no admin center e no painel da UOL.

**C1** Me oriente no onboarding de `telecomtc.com.br` no tenant M365 (Settings → Domains → Add domain). O wizard gera valores **próprios deste domínio** — me alerte para eu não reutilizar os de `tctelecom.com.br`.

**C2** Criar os endereços conforme a árvore de decisão do bloqueador P0.

**C3** Configurar DKIM para o domínio novo e DMARC iniciando em **`p=none`** — endurecer só depois de observar.

**C4** **Cutover de MX** na zona Azure DNS: dos registros da UOL para `*.mail.protection.outlook.com`, ajustando SPF e autodiscover na mesma janela. **Ponto de não-retorno parcial.** O rollback é a edição de um registro no portal Azure, válido só nas primeiras horas.

**C5** Validar entrega bidirecional real em **todos** os endereços que continuarão existindo. Observar **14 dias**.

**C6** **Cancelar a UOL.** Só com: export IMAP conferido, 14 dias de entrega estável, 4 hostnames corretos. **Ponto de não-retorno absoluto.**

---

## ARMADILHAS CONHECIDAS

| Sintoma | Causa real | Ação |
|---|---|---|
| Deploy falha perto de ~100 MB | Limite prático abaixo dos 250 MB documentados | É quota. Pare e reporte |
| `output_location` rejeitado | É relativo a `app_location`, não absoluto | Use `"."`, nunca `"/redirect"` |
| Oryx tenta buildar o app de redirect | Falta `skip_app_build: true` | Adicione ao workflow |
| Redirect manda tudo para a home | SWA não suporta capture group no destino | Use o gerador da B2 |
| `www` e apex servem ambos 200 | SWA não suporta redirect por hostname | Canonical via `metadataBase` |
| `az staticwebapp create` trava | `--login-with-github` exige device flow | Use deployment token |
| Região `brazilsouth` rejeitada | SWA não existe lá | Use `eastus2` |
| Formulário falha sem erro visível | CSP bloqueando o POST | `form-action` + `connect-src` |
| Smoke retorna 301 onde esperava 200 | `trailingSlash` divergente ou slug alterado | Regressão — corrija antes do cutover |
| E-mail cai em spam após C4 | DKIM/DMARC do domínio novo mal configurados | DMARC em `p=none`; conferir cabeçalho em envio real |

**Quotas SWA Free** (reconfirmar na doc oficial): 250 MB por environment · 500 MB somando environments · 15.000 arquivos · 100 GB de banda/mês **sem overage** (excedeu, o site para de ser servido) · 2 domínios customizados por app · 10 apps Free por assinatura · 3 preview environments.

## COMO RETOMAR EM SESSÃO NOVA

```
Leia CLAUDE.md, PLAN.md e docs/ADR-*.md.
Me diga em que fase estamos e qual é o próximo passo.
```

---FIM---

## Notas de uso

**Pré-requisitos:** `az login` feito, Node 22, `git`/`wget`/`dig` disponíveis, repositório `azrhaell/telecomtc-site` criado vazio no GitHub.

**O que o agente vai te pedir:** a resolução do bloqueador P0 (Fase 0.1), o export IMAP das caixas (A1.4), o export WXR (A2.1), a gravação do deployment token (A5), duas trocas de NS no registro.br (A6.3 e B1), a desinstalação do WordPress (A6.6), e toda a execução do Projeto C.

**A ordem existe por um motivo.** Os Projetos A e B são inteiramente reversíveis e provam a infraestrutura nova em produção antes que qualquer coisa de e-mail seja tocada. Quando o Projeto C começar, você já terá quatro hostnames funcionando e sete dias de evidência de que a plataforma nova aguenta. Encurtar essa sequência troca semanas de tranquilidade por horas de pressa.

**O único item sem rollback é o C6.** Tudo antes dele volta atrás: build por Git, publicação por redeploy, NS em minutos, MX em segundos nas primeiras horas. Depois do cancelamento da UOL, nada volta.
