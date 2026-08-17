# Segurança e proteção contra custos

Auditoria e proteções configuradas em 2026-08-16, a pedido do usuário, cujo receio
era **DDoS estourar cotas e gerar fatura inesperada**.

## Conclusão principal: o cenário temido é estruturalmente impossível

O site roda em **Azure Static Web Apps, plano Free**. Segundo a
[documentação oficial de cotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas):

| Recurso | Plano Free |
|---|---|
| Banda incluída | 100 GB/mês |
| **Banda excedente** | **"Unavailable"** |

Overage **não existe** no plano Free — não é caro, é inexistente. Se um ataque
consumir os 100 GB, o site **para de ser servido** até o ciclo virar. O modo de
falha é indisponibilidade, **nunca cobrança**.

Dimensionamento: o site tem ~5 MB. 100 GB ≈ 20 mil visitas completas/mês. Um site
institucional desse porte usa uma fração disso.

## Inventário faturável (auditado)

| Recurso | Plano | Custo |
|---|---|---|
| `swa-telecomtc-site` | Free | **R$ 0** — sem overage possível |
| Zona DNS `telecomtc.com.br` | Pública | ~US$ 0,50/mês + ~US$ 0,35/milhão de consultas |

Não há mais nada na assinatura. Gasto no ciclo atual: **0 BRL**.

## O único vetor de custo sem teto

**Azure DNS não permite limitar consultas.** Resposta oficial da Microsoft
([Q&A](https://learn.microsoft.com/en-us/answers/questions/289669/how-to-enforce-quota-of-dns-queries-on-azure-dns-z)):
*"there are minimal possibilities here to enforce a monthly quota here on this cost"*.
Um flood de DNS não tem limite de gasto.

**Exposição real hoje: praticamente zero**, por dois motivos:
1. A zona `telecomtc.com.br` **não é autoritativa** — o registro.br ainda delega
   para a UOL, então ela não recebe consultas.
2. O domínio no ar (`tctelecom.com.br`) usa o **DNS da Microsoft (M365)**, incluído
   na assinatura e não medido por consulta — não passa pelo Azure DNS.

⚠️ **Isso muda** se um dia os NS de `telecomtc.com.br` forem apontados para o Azure
DNS. Aí a zona passa a receber tráfego real e o vetor se torna ativo. Reavaliar
nesse momento.

## Proteções configuradas

| Proteção | Detalhe |
|---|---|
| **Orçamento** `orcamento-tctelecom` | US$ 5/mês (~10× o custo esperado) |
| Alertas de custo | 50%, 80%, 100% do realizado + **previsão** de estouro |
| **Alerta de tráfego** `alerta-trafego-anomalo` | dispara se `BytesSent` > 1 GB em 1h |
| Destino | `ag-tctelecom` → marcelo.lobo@tctelecom.com.br |

O alerta de tráfego existe porque, no plano Free, o risco **não é conta — é o site
sair do ar sem aviso**. A 1 GB/h os 100 GB durariam ~100 horas, o que dá tempo de
reagir (mitigar ou subir para Standard temporariamente).

**Limitação honesta:** orçamento no Azure **alerta, não bloqueia**. Contratos
Microsoft Customer Agreement não têm limite rígido de gasto. A proteção real aqui
vem da arquitetura (plano Free sem overage), não do orçamento.

## Auditoria de segredos (repositório é público)

- ✅ Token de deploy do SWA **nunca** entrou no repositório (verificado em todo o
  histórico com `git grep` sobre `git rev-list --all`)
- ✅ `.env.local` está no `.gitignore`
- ✅ Nenhum arquivo `.env`, `.pem`, `.key` ou backup rastreado
- ℹ️ A chave do Web3Forms **é pública no HTML por design** — não é segredo. O
  serviço fixa o destinatário na chave justamente para que expô-la não permita
  enviar para outro lugar.

## Riscos residuais e o que fazer

| Risco | Impacto | Mitigação |
|---|---|---|
| Flood consome 100 GB | Site fora do ar até o ciclo virar | Alerta de tráfego avisa antes; se recorrente, subir para Standard (US$ 9/mês) |
| Abuso do formulário | Esgota a cota do Web3Forms → formulário para | Já há honeypot (`botcheck`); se ocorrer, ativar hCaptcha no painel do Web3Forms |
| Flood de DNS (futuro) | Custo sem teto | Só se a zona virar autoritativa; hoje inaplicável |
| Vazamento do token de deploy | Deploy de conteúdo arbitrário | Está em GitHub Secrets; rotacionar com `az staticwebapp secrets reset-api-key` se suspeitar |

## O que NÃO foi feito, e por quê
**Azure DDoS Protection Standard** custa ~US$ 3.000/mês. É ordens de grandeza mais
caro que qualquer prejuízo possível neste ambiente — o pior caso aqui é o site ficar
fora do ar num plano gratuito. Proteção desproporcional ao risco.
