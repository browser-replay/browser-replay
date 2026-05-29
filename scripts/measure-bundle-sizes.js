#!/usr/bin/env node
/**
 * Bundle size reporter focused on the record path (critical after the snapshot-utils
 * tree-shaking work). Run via `pnpm size` or `pnpm size:analyze`.
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const ROOT = path.resolve(__dirname, '..');

const TARGETS = [
  {
    name: '@dom-replay/record',
    dist: 'packages/record/dist/record.js',
    label: 'record (ESM)',
    maxGzippedKB: 180,
  },
  {
    name: '@dom-replay/snapshot',
    dist: 'packages/snapshot/dist/snapshot.js',
    label: 'snapshot (full)',
    maxGzippedKB: 220,
  },
];

function getSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }
  const content = fs.readFileSync(filePath);
  const raw = content.length;
  const gzipped = gzipSync(content).length;
  return {
    exists: true,
    raw,
    gzipped,
    rawKB: (raw / 1024).toFixed(2),
    gzippedKB: (gzipped / 1024).toFixed(2),
  };
}

console.log('\n📦 dom-replay Bundle Size Report (Record Path Focus)\n');

let failed = false;

TARGETS.forEach((target) => {
  const fullPath = path.join(ROOT, target.dist);
  const size = getSize(fullPath);

  if (!size.exists) {
    console.log(`❌ ${target.label}`);
    console.log(`   Missing: ${target.dist}`);
    console.log(`   Run: pnpm --filter @dom-replay/record build (or pnpm build:all)\n`);
    failed = true;
    return;
  }

  const gzippedKB = parseFloat(size.gzippedKB);
  const passed = gzippedKB <= target.maxGzippedKB;

  console.log(`${passed ? '✅' : '⚠️ '} ${target.label}`);
  console.log(`   Raw:     ${size.rawKB} KB`);
  console.log(`   Gzipped: ${size.gzippedKB} KB  (threshold: ≤${target.maxGzippedKB} KB)`);

  if (!passed) {
    console.log(`   ❌ EXCEEDED THRESHOLD`);
    failed = true;
  } else {
    console.log(`   ✓ Within budget`);
  }
  console.log('');
});

if (failed) {
  console.log('Some size checks failed or bundles were missing.\n');
  // Do not hard-fail the script during early adoption — just warn.
  // Uncomment the next line when you are ready to enforce in CI:
  // process.exit(1);
}

console.log('Tips:');
console.log('  • ANALYZE=true pnpm build:all  → generates visualizer HTML reports');
console.log('  • pnpm size                    → runs this script');
console.log('  • These checks will become stricter after we land full tree-shaking wins.\n');