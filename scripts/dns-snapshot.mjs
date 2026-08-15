#!/usr/bin/env node
// Fase A1.3 — snapshot de DNS das duas zonas (substitui `dig` por dns.promises do Node,
// já que este ambiente Windows não tem dig/wget disponíveis — ver CLAUDE.md > Ambiente).
//
// Uso: node scripts/dns-snapshot.mjs > dns-snapshot-YYYYMMDD.txt

import dns from 'node:dns/promises';

const DOMAINS = ['telecomtc.com.br', 'tctelecom.com.br'];
const SERVICE_HOSTS = ['mail', 'webmail', 'smtp', 'pop', 'imap', 'pop3', 'smtps'];

async function tryResolve(fn, label) {
  try {
    return await fn();
  } catch (err) {
    return `(${label} vazio ou erro: ${err.code ?? err.message})`;
  }
}

function fmt(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  return String(value);
}

async function snapshotDomain(domain) {
  const lines = [`===== ${domain} =====`];

  lines.push('NS: ' + fmt(await tryResolve(() => dns.resolveNs(domain), 'NS')));
  lines.push('MX: ' + fmt(await tryResolve(() => dns.resolveMx(domain), 'MX')));
  lines.push('TXT: ' + fmt(await tryResolve(() => dns.resolveTxt(domain), 'TXT')));
  lines.push('A: ' + fmt(await tryResolve(() => dns.resolve4(domain), 'A')));
  lines.push(
    'CNAME www: ' + fmt(await tryResolve(() => dns.resolveCname(`www.${domain}`), 'CNAME www'))
  );
  lines.push(
    'CNAME autodiscover: ' +
      fmt(await tryResolve(() => dns.resolveCname(`autodiscover.${domain}`), 'CNAME autodiscover'))
  );
  lines.push(
    'CNAME selector1._domainkey: ' +
      fmt(
        await tryResolve(
          () => dns.resolveCname(`selector1._domainkey.${domain}`),
          'CNAME selector1'
        )
      )
  );
  lines.push(
    'CNAME selector2._domainkey: ' +
      fmt(
        await tryResolve(
          () => dns.resolveCname(`selector2._domainkey.${domain}`),
          'CNAME selector2'
        )
      )
  );
  lines.push(
    'TXT _dmarc: ' + fmt(await tryResolve(() => dns.resolveTxt(`_dmarc.${domain}`), 'TXT _dmarc'))
  );

  return lines.join('\n');
}

const out = [];
for (const domain of DOMAINS) {
  out.push(await snapshotDomain(domain));
}

// O setup da UOL não é padronizado como o do M365 — sondar hosts de serviço.
out.push('===== hosts de serviço em telecomtc.com.br =====');
for (const host of SERVICE_HOSTS) {
  const fqdn = `${host}.telecomtc.com.br`;
  const result = await tryResolve(() => dns.resolve4(fqdn), 'A');
  out.push(`${fqdn} -> ${fmt(result)}`);
}

console.log(out.join('\n\n'));
