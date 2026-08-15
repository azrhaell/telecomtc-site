# ADR-003 — E-mail fica fora de escopo; a UOL não é cancelada

## Status
Aceita (2026-08-15)

## Contexto
Os documentos de origem (`docs/source/`) partiam de uma especificação
com duas exigências que não coexistem como escritas:

- "não vou migrar os e-mails do domínio telecomtc.com.br"
- "cancelar tudo da UOL de vez"

As caixas `@telecomtc.com.br` estão hospedadas na UOL. Cancelar a UOL
sem mover o serviço de e-mail destruiria essas caixas de forma
irreversível. Os documentos de origem propunham resolver isso
onboardando o *serviço* de e-mail no Microsoft 365 (endereços
continuariam existindo, como alias ou caixa nova) sem migrar o
*conteúdo* histórico — o que tornaria "mesma administração M365" e
"cancelar a UOL" compatíveis.

## Decisão
Ao ser consultado sobre essa leitura no início desta execução
(2026-08-15), o usuário optou por uma resolução diferente e mais
simples: **o e-mail `@telecomtc.com.br` não é tocado de forma alguma**
neste projeto — nem o conteúdo, nem o serviço. Ele permanece na UOL
indefinidamente.

Consequência direta: **a UOL não pode ser cancelada por completo**,
porque continuaria sendo a provedora de e-mail desse domínio. O escopo
do projeto passa a ser:

- **Dentro do escopo**: migrar o *site* de `telecomtc.com.br` para o
  Azure (Projeto A) e o redirect de `tctelecom.com.br` (Projeto B). A
  UOL é **reduzida** — perde o site (WordPress) e a zona DNS de
  `telecomtc.com.br` — mas seu plano de e-mail é **mantido**.
- **Fora de escopo**: o Projeto C do runbook original inteiro —
  onboarding de `telecomtc.com.br` no tenant M365, árvore de decisão
  por endereço (alias / caixa nova / descarte), cutover de MX,
  cancelamento da UOL. Nenhuma dessas ações será executada nesta
  iteração do projeto.

## Consequências técnicas
- O MX de `telecomtc.com.br` (`mx.uhserver.com`) nunca muda neste
  projeto. É espelhado verbatim na zona Azure DNS (junto com SPF/DMARC,
  incluindo as anomalias já existentes — ver CLAUDE.md > Ambiente), do
  mesmo jeito que o e-mail de `tctelecom.com.br` já é espelhado verbatim
  para o Exchange Online.
- Como nenhuma ação de e-mail ou cancelamento de provedor acontece, **não
  sobra nenhuma ação irreversível no escopo atual**. Mesmo a troca de NS
  no registro.br (necessária para apontar cada domínio para sua zona no
  Azure DNS) é totalmente reversível em minutos.
- O export IMAP das caixas `@telecomtc.com.br`, que os documentos de
  origem tratavam como backup P0 bloqueante — proteção contra o
  cancelamento da UOL — deixa de ser um gate obrigatório deste projeto,
  já que a UOL não vai ser cancelada. Continua sendo boa prática geral
  de backup, mas por conta do usuário, fora do fluxo deste projeto.

## Revisão futura
Se o escopo mudar novamente (por exemplo, o usuário decidir migrar o
e-mail mais adiante), o runbook original em `docs/source/` tem o
Projeto C inteiro já desenhado (árvore de decisão, DKIM/DMARC, cutover
de MX, critérios de saída de 14 dias) e pode ser reativado como ponto de
partida — mas isso exige uma nova decisão explícita do usuário, e uma
nova ADR substituindo esta.
