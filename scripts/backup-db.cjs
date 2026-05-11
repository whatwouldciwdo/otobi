// =============================================================
// OTOBI Full Backup Script
// Usage  : npm run backup
// Output : backups/backup_YYYY-MM-DD_HH-MM-SS/
//   ├── data/          — JSON export semua tabel database
//   ├── storage/       — Download semua file dari Supabase Storage
//   └── manifest.json  — Ringkasan isi backup
// =============================================================

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');
const fs               = require('fs');
const path             = require('path');
const https            = require('https');
const http             = require('http');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Prisma ────────────────────────────────────────────────────
const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ── Supabase config ───────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SVC_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Bucket yang dipakai proyek ini
const STORAGE_BUCKETS = ['otobi', 'uploads'];

// ── Helpers ───────────────────────────────────────────────────

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  // Konversi ke WIB (UTC+7)
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return (
    `${wib.getUTCFullYear()}-${pad(wib.getUTCMonth() + 1)}-${pad(wib.getUTCDate())}` +
    `_${pad(wib.getUTCHours())}-${pad(wib.getUTCMinutes())}-${pad(wib.getUTCSeconds())}`
  );
}

function formatSize(bytes) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function writeJSON(dir, filename, data) {
  const filePath = path.join(dir, filename);
  const content  = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf8');
  return { size: Buffer.byteLength(content, 'utf8'), count: data.length };
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file  = fs.createWriteStream(destPath);
    proto.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.statSync(destPath).size);
      });
    }).on('error', (err) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// ── Supabase Storage API ──────────────────────────────────────

async function listStorageFiles(bucket, prefix = '') {
  const url  = `${SUPABASE_URL}/storage/v1/object/list/${bucket}`;
  const body = JSON.stringify({ prefix, limit: 1000, offset: 0 });

  const res  = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
      'apikey':        SUPABASE_SVC_KEY,
    },
    body,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`List bucket "${bucket}" failed: ${res.status} ${txt}`);
  }

  const items = await res.json();

  // Rekursif masuk subfolder
  const files = [];
  for (const item of items) {
    if (item.id === null) {
      // Ini folder — rekursif
      const sub = await listStorageFiles(bucket, prefix ? `${prefix}/${item.name}` : item.name);
      files.push(...sub);
    } else {
      files.push({
        bucket,
        name: prefix ? `${prefix}/${item.name}` : item.name,
        size: item.metadata?.size ?? 0,
        contentType: item.metadata?.mimetype ?? 'application/octet-stream',
        url: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${prefix ? prefix + '/' : ''}${item.name}`,
      });
    }
  }
  return files;
}

// ── Step 1: Backup Database ───────────────────────────────────

async function backupDatabase(dataDir) {
  console.log('\n━━━ 1/2  DATABASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tables = [
    { name: 'users',                  fetch: () => prisma.user.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'products',               fetch: () => prisma.product.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'cart_items',             fetch: () => prisma.cartItem.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'wishlist_items',         fetch: () => prisma.wishlistItem.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'orders',                 fetch: () => prisma.order.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'promos',                 fetch: () => prisma.promo.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'blogs',                  fetch: () => prisma.blog.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'link_items',             fetch: () => prisma.linkItem.findMany({ orderBy: { order: 'asc' } }) },
    { name: 'verification_tokens',    fetch: () => prisma.verificationToken.findMany({ orderBy: { createdAt: 'asc' } }) },
    { name: 'password_reset_tokens',  fetch: () => prisma.passwordResetToken.findMany({ orderBy: { createdAt: 'asc' } }) },
  ];

  const results = [];
  let totalBytes = 0;

  for (const table of tables) {
    process.stdout.write(`  ⏳ ${table.name.padEnd(24)}`);
    try {
      const data         = await table.fetch();
      const { size, count } = writeJSON(dataDir, `${table.name}.json`, data);
      totalBytes += size;
      results.push({ table: table.name, count, size, status: 'OK' });
      console.log(`✅  ${String(count).padStart(4)} rows   ${formatSize(size)}`);
    } catch (err) {
      results.push({ table: table.name, count: 0, size: 0, status: 'ERROR', error: err.message });
      console.log(`❌  ${err.message}`);
    }
  }

  const totalRows = results.reduce((s, r) => s + r.count, 0);
  console.log(`\n  📊 Database: ${totalRows} rows total | ${formatSize(totalBytes)}`);
  return { tables: results, totalRows, totalBytes };
}

// ── Step 2: Backup Storage (Images) ──────────────────────────

async function backupStorage(storageDir) {
  console.log('\n━━━ 2/2  STORAGE (GAMBAR) ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!SUPABASE_URL || !SUPABASE_SVC_KEY) {
    console.log('  ⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan, skip.\n');
    return { buckets: [], totalFiles: 0, totalBytes: 0 };
  }

  const bucketResults = [];
  let grandTotal = 0;
  let grandBytes = 0;

  for (const bucket of STORAGE_BUCKETS) {
    process.stdout.write(`  📂 Bucket "${bucket}"... `);

    let files = [];
    try {
      files = await listStorageFiles(bucket);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      bucketResults.push({ bucket, files: 0, bytes: 0, status: 'ERROR', error: err.message });
      continue;
    }

    if (files.length === 0) {
      console.log(`kosong, skip.`);
      bucketResults.push({ bucket, files: 0, bytes: 0, status: 'EMPTY' });
      continue;
    }

    console.log(`${files.length} file ditemukan`);

    let downloaded = 0;
    let bucketBytes = 0;
    let errors = 0;

    for (const file of files) {
      const destPath = path.join(storageDir, bucket, file.name);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });

      process.stdout.write(`    ↓ ${file.name.slice(0, 55).padEnd(55)}`);
      try {
        const size = await downloadFile(file.url, destPath);
        bucketBytes += size;
        downloaded++;
        console.log(` ✅ ${formatSize(size)}`);
      } catch (err) {
        errors++;
        console.log(` ❌ ${err.message}`);
      }
    }

    grandTotal += downloaded;
    grandBytes += bucketBytes;
    bucketResults.push({ bucket, files: downloaded, bytes: bucketBytes, errors, status: 'OK' });
    console.log(`  └─ ${bucket}: ${downloaded}/${files.length} file | ${formatSize(bucketBytes)}\n`);
  }

  console.log(`  🖼️  Storage: ${grandTotal} file total | ${formatSize(grandBytes)}`);
  return { buckets: bucketResults, totalFiles: grandTotal, totalBytes: grandBytes };
}

// ── Main ─────────────────────────────────────────────────────

async function backup() {
  const timestamp  = getTimestamp();
  const backupDir  = path.join(__dirname, '../backups', `backup_${timestamp}`);
  const dataDir    = path.join(backupDir, 'data');
  const storageDir = path.join(backupDir, 'storage');

  fs.mkdirSync(dataDir,    { recursive: true });
  fs.mkdirSync(storageDir, { recursive: true });

  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  📦  OTOBI FULL BACKUP`);
  console.log(`  🕐  ${timestamp.replace('_', ' ').replace(/-(\d{2})-(\d{2})$/, ':$1:$2')}`);
  console.log(`  📁  backups/backup_${timestamp}/`);
  console.log(`${'═'.repeat(54)}`);

  const dbResult  = await backupDatabase(dataDir);
  const stoResult = await backupStorage(storageDir);

  // ── Manifest ──
  const manifest = {
    project:     'otobi.id',
    timestamp,
    generatedAt: new Date().toISOString(),
    database:    dbResult,
    storage:     stoResult,
    summary: {
      totalRows:     dbResult.totalRows,
      totalFiles:    stoResult.totalFiles,
      totalSize:     formatSize(dbResult.totalBytes + stoResult.totalBytes),
    },
  };

  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // ── Final summary ──
  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  ✅  BACKUP SELESAI`);
  console.log(`  📊  ${dbResult.totalRows} rows database`);
  console.log(`  🖼️   ${stoResult.totalFiles} file gambar`);
  console.log(`  💾  Total ukuran: ${manifest.summary.totalSize}`);
  console.log(`  📁  backups/backup_${timestamp}/`);
  console.log(`${'═'.repeat(54)}\n`);
}

backup()
  .catch((err) => {
    console.error('\n❌ Backup gagal:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
