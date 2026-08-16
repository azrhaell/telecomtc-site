#!/usr/bin/env node
// Smoke test dos hostnames públicos, guardião do contrato de identidade
// (url-contract.txt). Substitui o laço de curl do runbook — este ambiente
// Windows não tem wget/dig, e Node já é o padrão dos outros scripts.
//
// Uso:
//   node scripts/smoke.mjs                                  # site: 200 em telecomtc.com.br + www
//   node scripts/smoke.mjs host1 host2                      # site: 200 nos hosts informados
//   node scripts/smoke.mjs --redirect tctelecom.com.br ...  # redirect: 301 com path preservado
//
// Modo padrão (site): cada URL do contrato deve responder 200 no MESMO path.
// Um 301 aqui indica trailingSlash divergente ou slug alterado na extração.
//
// Modo --redirect (Projeto B): cada URL deve responder 301 apontando para o
// mesmo path no domínio canônico. Um 200 ali indica conteúdo duplicado.

import { readFileSync } from 'node:fs';

const CANONICAL = 'https://telecomtc.com.br';
const CONCURRENCY = 6;

const args = process.argv.slice(2);
const redirectMode = args.includes('--redirect');
const hosts = args.filter((a) => !a.startsWith('--'));

const SITE_HOSTS = ['telecomtc.com.br', 'www.telecomtc.com.br'];
const REDIRECT_HOSTS = ['tctelecom.com.br', 'www.tctelecom.com.br'];
const targets = hosts.length > 0 ? hosts : redirectMode ? REDIRECT_HOSTS : SITE_HOSTS;

const paths = [
  ...new Set(
    readFileSync('url-contract.txt', 'utf8')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((u) => new URL(u).pathname),
  ),
].sort();

const failures = [];
const warnings = [];

async function checkOne(host, path) {
  const url = `https://${host}${path}`;
  let res;
  try {
    // redirect: 'manual' — precisamos ver o 301 em si, não segui-lo.
    res = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': 'telecomtc-smoke/1.0' } });
  } catch (err) {
    failures.push(`${host}${path} -> erro de rede: ${err.message}`);
    return;
  }

  if (redirectMode) {
    if (res.status !== 301) {
      failures.push(`FALHA ${host}${path} -> ${res.status} (esperado 301)`);
      return;
    }
    const location = res.headers.get('location');
    const expected = CANONICAL + path;
    if (location !== expected) {
      warnings.push(`AVISO path perdido: ${host}${path} -> ${location}`);
    }
  } else {
    if (res.status !== 200) {
      failures.push(`REGRESSAO ${host}${path} -> ${res.status} (esperado 200)`);
    }
  }
}

const queue = [];
for (const host of targets) {
  for (const path of paths) queue.push({ host, path });
}

console.log(
  `Smoke ${redirectMode ? '(redirect, espera 301)' : '(site, espera 200)'}: ` +
    `${targets.join(', ')} — ${paths.length} paths, ${queue.length} checagens`,
);

let cursor = 0;
async function worker() {
  while (cursor < queue.length) {
    const item = queue[cursor++];
    await checkOne(item.host, item.path);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

for (const w of warnings) console.log(w);
for (const f of failures) console.log(f);

if (failures.length > 0) {
  console.log(`\nSMOKE FALHOU — ${failures.length} de ${queue.length} checagens divergiram.`);
  process.exit(1);
}
console.log(`\nOK — ${queue.length} checagens passaram${warnings.length ? ` (${warnings.length} aviso(s))` : ''}.`);
process.exit(0);
