# ADR-005 — Migrar telecomtc.com.br para a Microsoft e desligar a UOL

## Status
Aceita (2026-08-17). **Reverte o [ADR-003](ADR-003-email-fora-de-escopo.md).**

## Contexto
O ADR-003 tirou o e-mail de escopo: `@telecomtc.com.br` ficaria na UOL
indefinidamente e a UOL não seria cancelada. Com o site já no ar em
`tctelecom.com.br` (ADR-004), o usuário decidiu o oposto: levar o domínio inteiro
para a Microsoft, junto com `tctelecom.com.br`, e **descontinuar a UOL**.

### Restrição descoberta no levantamento
**A Microsoft não é registradora de domínios.** Para `.com.br`, o registro fica
obrigatoriamente no registro.br. Portanto "transferir para a Microsoft de forma
integral" não pode significar mover o registro. O que é possível — e o que este ADR
adota:

| Camada | Onde fica |
|---|---|
| Registro do domínio | registro.br, **administrado pelo titular** (provedor NENHUM) |
| DNS | **Microsoft** (`ns*.bdm.microsoftonline.com`) |
| Tenant / identidade | Microsoft 365 (domínio já adicionado, pendente de verificação) |

Na prática é a mesma configuração do `tctelecom.com.br`, que é o que se pretendia.

### Onde os e-mails realmente estavam
Descoberta relevante e não óbvia: `homedir/etc/telecomtc.com.br/` e `homedir/mail/`
no backup do cPanel estão **vazios**, e a zona traz
`; Entradas para utilizar Email Profissional` com DKIM `pro._domainkey →
pro._domainkey.uhserver.com`. As caixas nunca estiveram no cPanel — estão no
**"Email Profissional" da UOL**, produto separado, em `uhserver.com`.

Consequência: **o backup de 428 MB não contém e-mail algum.** Ele cobre site, banco
de dados e arquivo de zona. O requisito "P0 — export IMAP antes de cancelar" do
runbook original **não está satisfeito**, e por decisão do usuário não será.

## Decisão

1. **Os endereços `@telecomtc.com.br` são extintos.** Não serão recriados no
   Exchange. Mensagens enviadas a eles passarão a falhar em definitivo.
2. **O histórico de e-mail é descartado sem backup.** Decisão consciente do usuário,
   tomada com a consequência apresentada.
3. **Provedor no registro.br → NENHUM**, devolvendo a administração ao titular e
   destravando a troca de nameservers. Isso resolve o impasse que travou o ADR-004
   (UOLHOST bloqueava a edição de DNS; o painel da UOL dizia não conseguir alterar).
4. **O e-mail público do site passa a ser `comercial@tctelecom.com.br`**, criado pelo
   usuário e confirmado no tenant. Executado antes de qualquer outra etapa, para o
   site nunca publicar um endereço morto.
5. **Nenhum registro de e-mail é criado para `telecomtc.com.br`** (sem MX, SPF, DKIM
   ou autodiscover). Domínio sem caixas não deve anunciar servidor de e-mail: geraria
   bounce confuso e ampliaria superfície para spoofing.

## Consequências

**O ponto de não-retorno C4 do runbook deixa de existir.** O C4 era o cutover de MX,
perigoso porque dividiria correspondência entre dois sistemas. Como os endereços são
extintos em vez de migrados, não há correspondência a dividir. Resta **um** passo
irreversível: o cancelamento da UOL — e o que ele destrói é exatamente o que o
usuário decidiu descartar.

**Ordem obrigatória no desligamento**, do menos para o mais destrutivo:
1. Desinstalar o WordPress (o site já está no Azure)
2. Cancelar o **Email Profissional** — é o que apaga as caixas
3. Cancelar a hospedagem cPanel

São contratos possivelmente **separados** na UOL: cancelar a hospedagem pode não
cancelar o Email Profissional, e vice-versa. Conferir faturas.

**Renovação vira responsabilidade do titular.** O domínio expira em **01/10/2026**.
Sem a UOLHOST como provedor, o boleto passa a ser emitido e pago no registro.br.
Domínio expirado derruba site e e-mail juntos — e este é o risco operacional mais
provável de todo o plano, muito mais que qualquer questão técnica.

**A zona `telecomtc.com.br` no Azure DNS perde a função.** Ela foi construída como
espelho (38 registros, diff zero) para um cutover que agora vai para a Microsoft, não
para o Azure. Passa a ser custo (~US$ 0,50/mês) sem uso. Reavaliar depois do Passo 3
— possivelmente excluir, ou reaproveitar se o domínio for servir o redirect via
Azure. Ver `SEGURANCA-E-CUSTOS.md`.

**`tctelecom.com.br` não é tocado.** É o e-mail principal da empresa, com 161
endereços no Exchange Online. O `scripts/mail-regression.sh` segue como guardião e
deve permanecer verde em todas as etapas.

## Risco assumido, registrado
Não há backup do e-mail de `@telecomtc.com.br` e não haverá. Depois do cancelamento
do Email Profissional, nem as mensagens nem os endereços são recuperáveis. Registrado
aqui para que a decisão fique atribuída e datada, não descoberta depois.
