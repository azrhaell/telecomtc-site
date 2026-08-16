#!/usr/bin/env node
// Espelha uma zona DNS para o Azure DNS a partir do ARQUIVO DE ZONA do provedor
// antigo — não a partir de consultas DNS.
//
// POR QUE ISSO EXISTE (erro de 2026-08-16): o `dns-snapshot.mjs` consulta uma
// lista fixa de nomes que eu imaginei. DNS não deixa listar uma zona, então ele
// nunca poderia descobrir registros cujo nome eu não adivinhasse. Resultado: a
// zona telecomtc.com.br foi espelhada com 7 de 38 registros e passou por
// "verbatim" — faltavam DKIM (pro/s1/s2._domainkey), os 5 SRV de autodiscover,
// os hosts de cPanel/ftp e os subdomínios de marketing (RD Station/SendGrid).
// O arquivo de zona do cPanel (backup: dnszones/<dominio>.db) lista tudo.
//
// Uso (o script só GERA os comandos; quem executa é você, depois de revisar):
//   az network dns record-set list -g <rg> -z <zona> -o json > estado-atual.json
//   node scripts/mirror-zone.mjs <zonefile> <zona> <rg> estado-atual.json > plano.sh
//   bash plano.sh
//
// Registros deliberadamente NÃO espelhados (o cutover existe para mudá-los):
//   - SOA e NS  → o Azure gerencia os seus
//   - o A do apex e o CNAME `www` → passam a apontar para o Static Web App

import { readFileSync } from 'node:fs';

const [zonePath, zoneName, resourceGroup, currentPath] = process.argv.slice(2);
const TTL = 300;

if (!zonePath || !zoneName || !resourceGroup || !currentPath) {
  console.error('uso: mirror-zone.mjs <zonefile> <zona> <resource-group> <estado-atual.json>');
  process.exit(2);
}

// aspas simples para o shell; ' vira '\''
const q = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`;

const SKIP_TYPES = new Set(['SOA', 'NS']);
// nomes cujo valor é intencionalmente diferente no Azure (apontam para o SWA)
const OVERRIDDEN = new Set(['@|A', 'www|CNAME']);

function unescapeTxt(v) {
  // zone file escapa ';' como '\;'
  return v.replace(/^"(.*)"$/s, '$1').replace(/\\;/g, ';');
}

function parseZone(text) {
  const out = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith(';') || t.startsWith('$')) continue;
    const m = line.match(/^(\S+)\s+(\d+)\s+IN\s+(A|AAAA|CNAME|MX|TXT|SRV)\s+(.+)$/);
    if (!m) continue;
    const [, rawName, , type, rawVal] = m;
    const name =
      rawName === `${zoneName}.` ? '@' : rawName.replace(new RegExp(`\\.${zoneName}\\.$`), '');
    out.push({ name, type, val: rawVal.trim() });
  }
  return out;
}

const desired = parseZone(readFileSync(zonePath, 'utf8')).filter(
  (r) => !SKIP_TYPES.has(r.type) && !OVERRIDDEN.has(`${r.name}|${r.type}`),
);

const current = JSON.parse(readFileSync(currentPath, 'utf8'));

function currentValues(name, type) {
  const rs = current.find((r) => r.name === name && r.type.split('/').pop() === type);
  if (!rs) return null;
  switch (type) {
    case 'A': return (rs.ARecords ?? []).map((x) => x.ipv4Address);
    case 'CNAME': return rs.CNAMERecord ? [rs.CNAMERecord.cname.replace(/\.$/, '')] : [];
    case 'MX': return (rs.MXRecords ?? []).map((x) => `${x.preference} ${x.exchange.replace(/\.$/, '')}`);
    case 'TXT': return (rs.TXTRecords ?? []).map((x) => x.value.join(''));
    // atenção: o Azure devolve SRVRecords (tudo maiúsculo), não SrvRecords —
    // errar isso faz o verificador reportar ausente algo que existe.
    case 'SRV': return (rs.SRVRecords ?? []).map((x) => `${x.priority} ${x.weight} ${x.port} ${x.target.replace(/\.$/, '')}`);
    default: return [];
  }
}

const base = `-g ${q(resourceGroup)} -z ${q(zoneName)}`;
const lines = [`#!/usr/bin/env bash`, `set -euo pipefail`, `export MSYS_NO_PATHCONV=1`, ``];
let pending = 0;

for (const r of desired) {
  const have = currentValues(r.name, r.type) ?? [];
  let want, cmd;

  if (r.type === 'CNAME') {
    want = r.val.replace(/\.$/, '');
    cmd = `az network dns record-set cname set-record ${base} -n ${q(r.name)} -c ${q(want)}`;
  } else if (r.type === 'A' || r.type === 'AAAA') {
    want = r.val;
    cmd = `az network dns record-set a add-record ${base} -n ${q(r.name)} -a ${q(want)}`;
  } else if (r.type === 'MX') {
    const [pref, ex] = r.val.split(/\s+/);
    want = `${pref} ${ex.replace(/\.$/, '')}`;
    cmd = `az network dns record-set mx add-record ${base} -n ${q(r.name)} --preference ${q(pref)} --exchange ${q(ex.replace(/\.$/, ''))}`;
  } else if (r.type === 'TXT') {
    want = unescapeTxt(r.val);
    cmd = `az network dns record-set txt add-record ${base} -n ${q(r.name)} -v ${q(want)}`;
  } else if (r.type === 'SRV') {
    const [p, w, port, target] = r.val.split(/\s+/);
    want = `${p} ${w} ${port} ${target.replace(/\.$/, '')}`;
    cmd = `az network dns record-set srv add-record ${base} -n ${q(r.name)} -p ${q(p)} -w ${q(w)} -r ${q(port)} -t ${q(target.replace(/\.$/, ''))}`;
  } else continue;

  if (have.includes(want)) continue; // já espelhado, nada a fazer
  pending++;
  const conflict = have.length ? `  (ja existe com outro valor: ${JSON.stringify(have)})` : '';
  // `--ttl` não é aceito por todos os add-record (srv não aceita), então o TTL
  // é ajustado num passo separado, uniforme, depois de tudo criado.
  lines.push(`echo '>> ${r.type} ${r.name} -> ${want.replace(/'/g, '')}'`);
  lines.push(`${cmd} -o none`);
  lines.push('');
  console.error(`  FALTA  ${r.type.padEnd(6)}${r.name.padEnd(26)}${want}${conflict}`);
}

console.error(`\nzona ${zoneName}: ${desired.length} desejados, ${pending} a aplicar`);
process.stdout.write(lines.join('\n') + '\n');
