# ADR-004 — O domínio canônico passa a ser tctelecom.com.br

## Status
Aceita (2026-08-16). **Reverte a direção definida no [ADR-001](ADR-001-direcao-do-redirect.md).**

## Contexto
O ADR-001 fixou `telecomtc.com.br` como domínio canônico (servindo o site) e
`tctelecom.com.br` como redirect. Toda a Fase A6 foi executada nessa direção: zona
espelho no Azure DNS com os 38 registros, domínios customizados validados no Static
Web App, certificados emitidos e testados.

O que impediu a conclusão **não foi técnico, foi administrativo**:

- No registro.br, `telecomtc.com.br` tem **UOLHOST (22) como Provedor de Serviços**.
  A documentação do registro.br é explícita: nessa condição o sistema "permitirá
  apenas a visualização" dos dados do domínio. Daí o campo de servidores DNS aparecer
  em modo leitura.
- O painel da UOL Host, por sua vez, classifica o domínio como "externo" e informa
  que **não é possível administrar os Servidores DNS por lá**.

As duas pontas se declaram incapazes. A saída seria trocar o provedor para NENHUM no
registro.br, devolvendo a administração ao titular — operação documentada, mas cujas
consequências exatas não foi possível confirmar na fonte oficial (a página específica
do registro.br não renderizou para consulta). O usuário optou, corretamente, por não
executar uma mudança administrativa no domínio sem certeza.

## Decisão
`tctelecom.com.br` passa a ser o **domínio canônico** do site:

| Hostname | Papel |
|---|---|
| `tctelecom.com.br` | site (canônico) — registro **A** → IP estável do SWA |
| `www.tctelecom.com.br` | site — **CNAME** → hostname do SWA |
| `telecomtc.com.br` | segue servindo o WordPress antigo na UOL; destino a decidir |

A diferença que viabiliza este caminho: `tctelecom.com.br` **não tem provedor** no
registro.br — o titular administra direto. Além disso, seu DNS está na Microsoft, e
o admin do M365 permite acrescentar registros A e CNAME customizados, então o site é
apontado **sem migrar a zona** e sem encostar em nenhum registro de e-mail.

## Consequências

**Positivas**
- Destrava o projeto sem depender de resolver o impasse UOLHOST × registro.br.
- Alinha o site ao domínio que a empresa já usa no e-mail principal (Exchange Online).
- Toca apenas 2 registros de DNS, ambos de site. MX, SPF, DKIM, DMARC e autodiscover
  ficam intocados — o que importa muito aqui, porque este domínio carrega o e-mail
  **principal** da empresa.

**Negativas / a monitorar**
- **O apex perde a distribuição global.** O DNS da Microsoft não suporta ALIAS/ANAME,
  então `tctelecom.com.br` (sem `www`) vai por registro `A` apontando para o
  `stableInboundIP` do SWA — servido por um único host regional (East US 2). O `www`,
  por CNAME, mantém a distribuição global. É o caminho que a própria Microsoft
  documenta quando o provedor de DNS não tem ALIAS.
- **Depende de um IP.** Se a Microsoft mudar o `stableInboundIP`, o apex quebra. O
  nome sugere estabilidade e a documentação recomenda o uso, mas é uma dependência
  que o ALIAS não teria.
- **SEO:** o site muda de domínio. Diferente do plano original — que não previa
  Change of Address porque o domínio não mudaria — agora há troca real. Enquanto o
  WordPress antigo seguir no ar em `telecomtc.com.br`, existe conteúdo duplicado.
  O usuário optou por deixar assim por ora e decidir depois.

## Trabalho preservado
Nada do que foi feito para `telecomtc.com.br` é perdido, apenas suspenso: a zona
espelho no Azure DNS continua criada e correta (38 registros, diff zero contra o
arquivo de zona), e `scripts/mirror-zone.mjs` reconstrói o estado a qualquer momento.
Se o impasse do provedor for resolvido, basta apontar os NS e retomar — provavelmente
já com `telecomtc.com.br` redirecionando para `tctelecom.com.br`, invertendo o que o
ADR-001 previa.

## Alternativa considerada e descartada por ora
Mover a zona de `tctelecom.com.br` para o Azure DNS resolveria o problema do apex
(ALIAS de verdade). É possível — o domínio não tem provedor. Mas significa migrar a
hospedagem de DNS do domínio que carrega o e-mail principal da empresa, e a lição da
Fase A6 foi clara: espelho só é confiável quando derivado do **arquivo de zona
completo**, não de consultas. Fica como projeto próprio, a ser feito com a lista
completa de registros exportada do M365 em mãos.
