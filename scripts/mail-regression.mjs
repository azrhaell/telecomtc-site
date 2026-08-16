#!/usr/bin/env node
// Regressão de e-mail — compara os registros de e-mail AO VIVO dos dois domínios
// contra o snapshot commitado (dns-snapshot-20260815.txt). Qualquer divergência é
// falha, nunca "melhoria" — ver CLAUDE.md > Invioláveis.
//
// Cobre exatamente os campos que as "paradas obrigatórias" protegem: MX, SPF (TXT
// raiz), autodiscover, DKIM (selector1/selector2) e _dmarc. Não compara A/CNAME do
// site (esses mudam de propósito em A6/B, não são "e-mail").
//
// Uso: node scripts/mail-regression.mjs
// (ou: bash scripts/mail-regression.sh)

import dns from 'node:dns/promises';
import { readFileSync } from 'node:fs';

const DOMAINS = ['telecomtc.com.br', 'tctelecom.com.br'];

function parseSnapshot(text) {
  const domains = {};
  let current = null;
  for (const line of text.split('\n')) {
    const header = line.match(/^===== ([a-z0-9.-]+) =====$/);
    if (header) {
      current = header[1];
      domains[current] = {};
      continue;
    }
    if (!current) continue;
    const kv = line.match(/^([A-Za-z0-9_. ]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    if (/^\(.*(vazio ou erro|nao encontrad|não encontrad)/i.test(rawValue)) {
      // dns-snapshot.mjs grava esse texto quando a consulta não achou nada —
      // equivalente a "sem registro", não a um valor de verdade.
      domains[current][key.trim()] = null;
    } else if (rawValue.startsWith('[') || rawValue.startsWith('{')) {
      try {
        domains[current][key.trim()] = JSON.parse(rawValue);
      } catch {
        domains[current][key.trim()] = rawValue;
      }
    } else {
      domains[current][key.trim()] = rawValue;
    }
  }
  return domains;
}

function normalize(value) {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => (Array.isArray(v) ? v.join('') : typeof v === 'object' ? JSON.stringify(v) : String(v)))
      .sort();
  }
  return [String(value)];
}

function sameSet(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na.length !== nb.length) return false;
  return na.every((v, i) => v === nb[i]);
}

async function liveRecords(domain) {
  const out = {};
  const safe = async (fn) => {
    try {
      return await fn();
    } catch {
      return null;
    }
  };
  out['MX'] = await safe(() => dns.resolveMx(domain));
  out['TXT'] = await safe(() => dns.resolveTxt(domain));
  out['CNAME autodiscover'] = await safe(() => dns.resolveCname(`autodiscover.${domain}`));
  out['CNAME selector1._domainkey'] = await safe(() => dns.resolveCname(`selector1._domainkey.${domain}`));
  out['CNAME selector2._domainkey'] = await safe(() => dns.resolveCname(`selector2._domainkey.${domain}`));
  out['TXT _dmarc'] = await safe(() => dns.resolveTxt(`_dmarc.${domain}`));
  return out;
}

const snapshotPath = process.argv[2] ?? 'dns-snapshot-20260815.txt';
const snapshot = parseSnapshot(readFileSync(snapshotPath, 'utf8'));

let fail = false;
for (const domain of DOMAINS) {
  console.log(`===== ${domain} =====`);
  const expected = snapshot[domain] ?? {};
  const live = await liveRecords(domain);

  for (const field of ['MX', 'TXT', 'CNAME autodiscover', 'CNAME selector1._domainkey', 'CNAME selector2._domainkey', 'TXT _dmarc']) {
    // Na raiz convivem TXT que não são de e-mail (tokens de verificação de
    // domínio do Azure/Google/Facebook etc.). O que este teste protege é o
    // SPF — então compara só os registros `v=spf1`, e ignora o resto. Sem
    // isso, adicionar um token legítimo viraria falso positivo, e um teste
    // que grita por qualquer coisa acaba sendo ignorado quando importa.
    const isRootTxt = field === 'TXT';
    const onlySpf = (v) => (Array.isArray(v) ? v.filter((r) => (Array.isArray(r) ? r.join('') : String(r)).startsWith('v=spf1')) : v);
    const exp = isRootTxt ? onlySpf(expected[field]) : expected[field];
    const got = isRootTxt ? onlySpf(live[field]) : live[field];
    const ok = sameSet(exp, got);
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${isRootTxt ? 'TXT (só SPF)' : field}`);
    if (!ok) {
      console.log(`       esperado: ${JSON.stringify(exp)}`);
      console.log(`       ao vivo:  ${JSON.stringify(got)}`);
      fail = true;
    }
  }
}

if (fail) {
  console.log('\nREGRESSÃO DE E-MAIL FALHOU — algum registro divergiu do snapshot. Não prossiga.');
  process.exit(1);
} else {
  console.log('\nOK — nenhuma divergência de e-mail em relação ao snapshot.');
  process.exit(0);
}
