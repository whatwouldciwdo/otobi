// =============================================================
// OTOBI Restore Script
// Usage  : node scripts/restore-db.cjs backups/backup_YYYY-MM-DD_HH-MM-SS
//
// Restore urutan:
//   1. Truncate semua tabel (aman, ada cascade)
//   2. Re-insert data dari JSON
//   3. Upload ulang file gambar ke Supabase Storage
// =============================================================

const { PrismaClient } = require('@prisma/client');
const { PrismaPg }     = require('@prisma/adapter-pg');
const { Pool }         = require('pg');
const fs               = require('fs');
const path             = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ── Prisma ────────────────────────────────────────────────────
const pool    = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });

// ── Supabase config ───────────────────────────────────────────
const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── Helpers ───────────────────────────────────────────────────

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatSize(bytes) {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ── Step 1: Restore Database ──────────────────────────────────

async function restoreDatabase(dataDir) {
  console.log('\n━━━ 1/2  DATABASE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Hapus semua data lama dengan urutan yang aman (hindari FK violation)
  console.log('  🗑️  Menghapus data lama...');
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.linkItem.deleteMany();
  await prisma.promo.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅  Data lama dihapus\n');

  // Urutan insert: parent dulu, baru child (sesuai FK)
  const restoreSteps = [
    {
      name: 'users',
      file: 'users.json',
      insert: (rows) => prisma.user.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'products',
      file: 'products.json',
      insert: (rows) => prisma.product.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'cart_items',
      file: 'cart_items.json',
      insert: (rows) => prisma.cartItem.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'wishlist_items',
      file: 'wishlist_items.json',
      insert: (rows) => prisma.wishlistItem.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'orders',
      file: 'orders.json',
      insert: (rows) => prisma.order.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'promos',
      file: 'promos.json',
      insert: (rows) => prisma.promo.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'blogs',
      file: 'blogs.json',
      insert: (rows) => prisma.blog.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'link_items',
      file: 'link_items.json',
      insert: (rows) => prisma.linkItem.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'verification_tokens',
      file: 'verification_tokens.json',
      insert: (rows) => prisma.verificationToken.createMany({ data: rows, skipDuplicates: true }),
    },
    {
      name: 'password_reset_tokens',
      file: 'password_reset_tokens.json',
      insert: (rows) => prisma.passwordResetToken.createMany({ data: rows, skipDuplicates: true }),
    },
  ];

  let totalRows = 0;

  for (const step of restoreSteps) {
    const filePath = path.join(dataDir, step.file);
    const rows     = readJSON(filePath);

    if (rows.length === 0) {
      console.log(`  ⏭️  ${step.name.padEnd(24)} kosong, skip`);
      continue;
    }

    process.stdout.write(`  ⏳ ${step.name.padEnd(24)}`);
    try {
      // Parse ulang field Decimal/DateTime yang tersimpan sebagai string
      const cleaned = rows.map((r) => {
        const obj = { ...r };
        // Decimal fields
        if (obj.price !== undefined) obj.price = parseFloat(obj.price);
        return obj;
      });

      await step.insert(cleaned);
      totalRows += rows.length;
      console.log(`✅  ${rows.length} rows`);
    } catch (err) {
      console.log(`❌  ${err.message}`);
    }
  }

  console.log(`\n  📊 Database restored: ${totalRows} rows total`);
  return totalRows;
}

// ── Step 2: Restore Storage (Images) ─────────────────────────

async function restoreStorage(storageDir) {
  console.log('\n━━━ 2/2  STORAGE (GAMBAR) ━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (!SUPABASE_URL || !SUPABASE_SVC_KEY) {
    console.log('  ⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan, skip.\n');
    return 0;
  }

  if (!fs.existsSync(storageDir)) {
    console.log('  ⚠️  Folder storage/ tidak ada dalam backup ini, skip.\n');
    return 0;
  }

  const buckets = fs.readdirSync(storageDir).filter((name) =>
    fs.statSync(path.join(storageDir, name)).isDirectory()
  );

  if (buckets.length === 0) {
    console.log('  ℹ️  Tidak ada bucket ditemukan dalam backup, skip.\n');
    return 0;
  }

  let totalUploaded = 0;
  let totalBytes    = 0;

  for (const bucket of buckets) {
    const bucketPath = path.join(storageDir, bucket);
    const files      = getAllFiles(bucketPath);

    console.log(`  📂 Bucket "${bucket}" — ${files.length} file`);

    for (const filePath of files) {
      const relativeName  = path.relative(bucketPath, filePath).replace(/\\/g, '/');
      const fileBuffer    = fs.readFileSync(filePath);
      const contentType   = guessContentType(filePath);
      const uploadUrl     = `${SUPABASE_URL}/storage/v1/object/${bucket}/${relativeName}`;

      process.stdout.write(`    ↑ ${relativeName.slice(0, 55).padEnd(55)}`);

      try {
        const res = await fetch(uploadUrl, {
          method:  'PUT',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SVC_KEY}`,
            'apikey':        SUPABASE_SVC_KEY,
            'Content-Type':  contentType,
            'x-upsert':      'true', // overwrite kalau sudah ada
          },
          body: fileBuffer,
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`${res.status} ${txt}`);
        }

        totalUploaded++;
        totalBytes += fileBuffer.length;
        console.log(` ✅ ${formatSize(fileBuffer.length)}`);
      } catch (err) {
        console.log(` ❌ ${err.message}`);
      }
    }
    console.log('');
  }

  console.log(`  🖼️  Storage restored: ${totalUploaded} file | ${formatSize(totalBytes)}`);
  return totalUploaded;
}

// ── Utility ───────────────────────────────────────────────────

function getAllFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png',  '.gif': 'image/gif',
    '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
  };
  return map[ext] || 'application/octet-stream';
}

// ── Main ─────────────────────────────────────────────────────

async function restore() {
  const backupArg = process.argv[2];

  if (!backupArg) {
    console.error('\n❌ Tentukan folder backup:\n   node scripts/restore-db.cjs backups/backup_YYYY-MM-DD_HH-MM-SS\n');
    process.exit(1);
  }

  const backupDir  = path.isAbsolute(backupArg)
    ? backupArg
    : path.join(__dirname, '..', backupArg);
  const dataDir    = path.join(backupDir, 'data');
  const storageDir = path.join(backupDir, 'storage');

  if (!fs.existsSync(backupDir)) {
    console.error(`\n❌ Folder tidak ditemukan: ${backupDir}\n`);
    process.exit(1);
  }

  // Baca manifest
  const manifestPath = path.join(backupDir, 'manifest.json');
  const manifest     = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    : {};

  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  🔄  OTOBI RESTORE`);
  console.log(`  📦  ${path.basename(backupDir)}`);
  if (manifest.generatedAt) {
    console.log(`  🕐  Dibuat: ${new Date(manifest.generatedAt).toLocaleString('id-ID')}`);
  }
  console.log(`${'═'.repeat(54)}`);
  console.log('\n  ⚠️  PERHATIAN: Semua data saat ini akan DIGANTI dengan data backup ini.');
  console.log('  Lanjutkan? Jalankan dengan: node scripts/restore-db.cjs <folder> --confirm\n');

  if (!process.argv.includes('--confirm')) {
    console.log('  ❌  Tambahkan --confirm untuk melanjutkan restore.\n');
    process.exit(0);
  }

  const totalRows  = await restoreDatabase(dataDir);
  const totalFiles = await restoreStorage(storageDir);

  console.log(`\n${'═'.repeat(54)}`);
  console.log(`  ✅  RESTORE SELESAI`);
  console.log(`  📊  ${totalRows} rows database`);
  console.log(`  🖼️   ${totalFiles} file gambar`);
  console.log(`${'═'.repeat(54)}\n`);
}

restore()
  .catch((err) => {
    console.error('\n❌ Restore gagal:', err.message);
    console.error(err.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
