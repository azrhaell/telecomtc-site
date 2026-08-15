#!/usr/bin/env node
// Fase A1.1 (gate de quota) + A1.2 (contrato de URLs) — substitui `wget --mirror` /
// `wget --spider`, indisponíveis neste ambiente Windows (ver CLAUDE.md > Ambiente).
//
// Faz um crawl same-origin do site em produção, salva os arquivos em ./mirror-uol/
// (preservando paths, como wget --mirror) e escreve url-contract.txt com toda URL
// visitada. Ao final, aplica o gate de quota do SWA Free (250 MB / 15.000 arquivos,
// alvo 200 MB / 12.000) e reporta PASS/FAIL — não tenta contornar.
//
// Uso: node scripts/mirror-gate.mjs https://telecomtc.com.br

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { URL } from 'node:url';

const START = process.argv[2] ?? 'https://telecomtc.com.br';
const OUT_DIR = 'mirror-uol';
const CONCURRENCY = 4;
const DELAY_MS = 150;
const MAX_PAGES = 20000; // válvula de segurança contra crawl infinito
const HARD_FILE_LIMIT = 15000; // limite duro do SWA Free — para o crawl se estourar
const TARGET_MB = 200;
const HARD_MB = 250;
const TARGET_FILES = 12000;

const EXCLUDE_PATTERNS = [/\/wp-admin\//, /\/wp-login\.php/, /\/xmlrpc\.php/, /\/wp-json\//, /\/feed\/?$/];

const origin = new URL(START).origin;
const rootHost = new URL(START).hostname.replace(/^www\./, '');

function sameSite(u) {
  try {
    const parsed = new URL(u, origin);
    const host = parsed.hostname.replace(/^www\./, '');
    return host === rootHost && (parsed.protocol === 'http:' || parsed.protocol === 'https:');
  } catch {
    return false;
  }
}

function shouldSkip(u) {
  return EXCLUDE_PATTERNS.some((re) => re.test(u));
}

function localPathFor(urlStr) {
  const u = new URL(urlStr);
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/') || !path.extname(p)) {
    p = path.join(p, 'index.html');
  }
  return path.join(OUT_DIR, u.hostname.replace(/^www\./, ''), p);
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const attrRe = /\b(?:href|src|srcset)=["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(html))) {
    const raw = m[1].split(',')[0].trim().split(/\s+/)[0]; // primeiro item de srcset
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) {
      continue;
    }
    try {
      const abs = new URL(raw, baseUrl).toString().split('#')[0];
      links.add(abs);
    } catch {
      // ignora URL inválida
    }
  }
  return links;
}

const visited = new Set();
const queue = [START];
const allUrls = new Set(); // só URLs confirmadas com 200 direto (sem redirect) entram aqui
const redirects = [];
const errors = [];
let fileCount = 0;
let totalBytes = 0;
let uploadsBytes = 0;
let stopped = false;

function enqueue(url) {
  if (!sameSite(url) || shouldSkip(url) || visited.has(url) || queue.includes(url)) return;
  if (visited.size + queue.length >= MAX_PAGES) return;
  queue.push(url);
}

async function fetchOne(url) {
  if (visited.has(url) || shouldSkip(url) || stopped) return;
  visited.add(url);

  await new Promise((r) => setTimeout(r, DELAY_MS));

  let res;
  try {
    // redirect: 'manual' — uma URL que redireciona NÃO é conteúdo canônico; ela não
    // deve ser salva no path (colidiria com o destino) nem entrar no contrato de URLs.
    // Só a URL final, com 200 direto, conta.
    res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; telecomtc-migration-mirror/1.0)' },
      redirect: 'manual',
    });
  } catch (err) {
    errors.push(`${url} -> fetch error: ${err.message}`);
    return;
  }

  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get('location');
    if (location) {
      const target = new URL(location, url).toString();
      redirects.push(`${url} -> ${res.status} -> ${target}`);
      enqueue(target);
    }
    return;
  }

  if (!res.ok) {
    errors.push(`${url} -> HTTP ${res.status}`);
    return;
  }

  const contentType = res.headers.get('content-type') ?? '';
  const buf = Buffer.from(await res.arrayBuffer());
  const localPath = localPathFor(url);

  await mkdir(path.dirname(localPath), { recursive: true });
  await writeFile(localPath, buf);

  allUrls.add(url);
  fileCount += 1;
  totalBytes += buf.length;
  if (/\/wp-content\/uploads\//.test(new URL(url).pathname)) {
    uploadsBytes += buf.length;
  }

  if (fileCount >= HARD_FILE_LIMIT) {
    stopped = true;
    return;
  }

  if (contentType.includes('text/html') && sameSite(url)) {
    const html = buf.toString('utf8');
    for (const link of extractLinks(html, url)) {
      enqueue(link);
    }
  }
}

async function worker() {
  while (queue.length > 0 && !stopped) {
    const url = queue.shift();
    if (!url) continue;
    await fetchOne(url);
  }
}

console.log(`Crawling ${START} (same-origin, concorrência=${CONCURRENCY})...`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

if (stopped) {
  console.log(`\nPARADO: atingiu o limite duro de ${HARD_FILE_LIMIT} arquivos durante o crawl.`);
}

// url-contract.txt é o contrato de IDENTIDADE DE CONTEÚDO, não um dump cru do crawl.
// Ativos de implementação do WordPress/Elementor (plugins, tema, wp-includes, CSS
// auto-gerado do Elementor por post) não existirão no site Next.js — incluí-los faria
// o smoke test (A6.4) falhar sempre após a migração, e infrataria o gerador de redirect
// (B2) com dezenas de rotas sem sentido. Só entram: páginas de conteúdo e mídia
// realmente enviada (wp-content/uploads/AAAA/MM/...).
function isContentUrl(u) {
  const p = new URL(u).pathname;
  if (/^\/wp-content\/(plugins|themes)\//.test(p)) return false;
  if (/^\/wp-includes\//.test(p)) return false;
  if (/^\/wp-content\/uploads\/elementor\//.test(p)) return false; // CSS auto-gerado por post
  return true;
}

const fullCrawlList = [...allUrls].filter(sameSite).sort();
const urlContract = fullCrawlList.filter(isContentUrl);
const implementationAssets = fullCrawlList.filter((u) => !isContentUrl(u));

await writeFile('url-contract.txt', urlContract.join('\n') + '\n');
await writeFile(
  'mirror-crawl-full.txt',
  '# Todas as URLs baixadas pelo crawl, incluindo ativos de implementação do WP/Elementor.\n' +
    '# Não é o contrato de identidade (esse é url-contract.txt) — é só referência para a\n' +
    '# extração de conteúdo (Fase A2) e inventário de plugins.\n\n' +
    fullCrawlList.join('\n') +
    '\n'
);

const totalMB = totalBytes / (1024 * 1024);
const uploadsMB = uploadsBytes / (1024 * 1024);

console.log('\n===== Resultado do crawl =====');
console.log(`Arquivos baixados: ${fileCount}`);
console.log(`Tamanho total: ${totalMB.toFixed(1)} MB`);
console.log(`Tamanho de wp-content/uploads: ${uploadsMB.toFixed(1)} MB`);
console.log(`URLs de conteúdo (url-contract.txt): ${urlContract.length}`);
console.log(`Ativos de implementação WP/Elementor (mirror-crawl-full.txt, fora do contrato): ${implementationAssets.length}`);
console.log(`Redirecionamentos seguidos (não entram no contrato): ${redirects.length}`);
if (redirects.length > 0) {
  redirects.forEach((r) => console.log('  ' + r));
}
console.log(`Erros/páginas puladas: ${errors.length}`);
if (errors.length > 0) {
  console.log('\nPrimeiros erros:');
  errors.slice(0, 20).forEach((e) => console.log('  ' + e));
  if (errors.length > 20) console.log(`  ... e mais ${errors.length - 20}`);
}

console.log('\n===== Gate de quota SWA Free =====');
console.log(`Tamanho: ${totalMB.toFixed(1)} MB (alvo < ${TARGET_MB} MB, limite duro ${HARD_MB} MB)`);
console.log(`Arquivos: ${fileCount} (alvo < ${TARGET_FILES}, limite duro ${HARD_FILE_LIMIT})`);

const sizeFail = totalMB >= HARD_MB;
const countFail = fileCount >= HARD_FILE_LIMIT;
const sizeWarn = totalMB >= TARGET_MB;
const countWarn = fileCount >= TARGET_FILES;

if (sizeFail || countFail) {
  console.log('\nREPROVADO — acima do limite duro do SWA Free. Parar e reportar (ver runbook §10).');
  process.exit(1);
} else if (sizeWarn || countWarn) {
  console.log('\nAVISO — acima do alvo recomendado, mas ainda dentro do limite duro. Seguir com atenção.');
  process.exit(0);
} else {
  console.log('\nOK — dentro do alvo.');
  process.exit(0);
}
