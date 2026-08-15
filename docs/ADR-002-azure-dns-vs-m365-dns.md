# ADR-002 — As duas zonas DNS vão para o Azure DNS, não para o DNS do M365

## Status
Aceita (2026-08-15)

## Contexto
`tctelecom.com.br` já é gerenciado pelo DNS do Microsoft 365 hoje
(confirmado ao vivo em 2026-08-15: NS `ns[1-4].bdm.microsoftonline.com`).
Seria natural mover `telecomtc.com.br` para o mesmo lugar, para os dois
domínios ficarem "num lugar só". Isso esbarra numa restrição técnica.

## Restrição técnica
O DNS gerenciado pelo Microsoft 365 **não suporta ALIAS/ANAME no apex**.
Ele aceita registros customizados `A` e `CNAME`, mas o apex exige um `A`
com IP fixo — e o Azure Static Web Apps não tem IP garantido. Apoiar o
site principal (`telecomtc.com.br`, sem `www`) sobre um IP que a própria
Microsoft documenta como contorno é risco de indisponibilidade no ativo
mais importante do projeto.

## Opções avaliadas
| Opção | Mecânica | Avaliação |
|---|---|---|
| Ambas no DNS do M365 | Apex com `A` fixo apontando pro IP de entrada do SWA | Custa R$ 0, mas coloca o site principal sobre um IP sem garantia. **Descartada.** |
| Ambas no Azure DNS (adotada) | *Alias record* no apex de cada zona, apontando direto pro SWA correspondente | Continua sendo Microsoft, continua sendo um lugar só, entrega o primitivo correto. ~US$ 1/mês pelas duas zonas. |

## Decisão
As duas zonas (`telecomtc.com.br` e `tctelecom.com.br`) migram para o
Azure DNS. O pedido de "mesma administração" é atendido em substância:
os dois domínios ficam sob o mesmo tenant/portal Microsoft (M365 para
e-mail, Azure para DNS), sem depender de um IP não garantido para o
recurso mais importante.

## Efeito colateral positivo
Mover a zona de `telecomtc.com.br` para o Azure DNS **antes** de
qualquer mudança em registros de e-mail torna qualquer futura alteração
de e-mail mais segura: a edição de um registro no portal Azure tem
rollback em segundos, ao contrário de uma mudança no painel da UOL. Isso
não é usado neste projeto (e-mail está fora de escopo — ver ADR-003),
mas fica registrado como propriedade da arquitetura escolhida.
