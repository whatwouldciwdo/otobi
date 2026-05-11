// =============================================================
// OTOBI Database Backup Script
// Usage  : node scripts/backup-db.cjs
// Output : backups/backup_YYYY-MM-DD_HH-MM-SS/
// Tables : User, Product, CartItem, WishlistItem, Order,
//          Promo, Blog, LinkItem, VerificationToken, PasswordResetToken
// =============================================================

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Helpers ──────────────────────────────────────────────────

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  );
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function writeJSON(dir, filename, data) {
  const filePath = path.join(dir, filename);
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, 'utf8');
  return { filePath, size: Buffer.byteLength(content, 'utf8'), count: data.length };
}

// ── Main ─────────────────────────────────────────────────────

async function backup() {
  const timestamp = getTimestamp();
  const backupDir = path.join(__dirname, '../backups', `backup_${timestamp}`);

  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`\n📦 OTOBI Database Backup`);
  console.log(`🕐 ${timestamp.replace('_', ' ').replace(/-/g, ':').replace(':', '-').replace(':', '-')}`);
  console.log(`📁 Output: backups/backup_${timestamp}/\n`);

  const results = [];

  // ── Export each table ──────────────────────────────────────

  const tables = [
    {
      name: 'users',
      fetch: () => prisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'products',
      fetch: () => prisma.product.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'cart_items',
      fetch: () => prisma.cartItem.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'wishlist_items',
      fetch: () => prisma.wishlistItem.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'orders',
      fetch: () => prisma.order.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'promos',
      fetch: () => prisma.promo.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'blogs',
      fetch: () => prisma.blog.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'link_items',
      fetch: () => prisma.linkItem.findMany({ orderBy: { order: 'asc' } }),
    },
    {
      name: 'verification_tokens',
      fetch: () => prisma.verificationToken.findMany({ orderBy: { createdAt: 'asc' } }),
    },
    {
      name: 'password_reset_tokens',
      fetch: () => prisma.passwordResetToken.findMany({ orderBy: { createdAt: 'asc' } }),
    },
  ];

  for (const table of tables) {
    process.stdout.write(`  ⏳ Exporting ${table.name}...`);
    try {
      const data = await table.fetch();
      const { filePath, size, count } = writeJSON(backupDir, `${table.name}.json`, data);
      results.push({ table: table.name, count, size, status: 'OK' });
      console.log(` ✅  ${count} rows  (${formatSize(size)})`);
    } catch (err) {
      results.push({ table: table.name, count: 0, size: 0, status: 'ERROR', error: err.message });
      console.log(` ❌  ERROR: ${err.message}`);
    }
  }

  // ── Write manifest ─────────────────────────────────────────

  const manifest = {
    project: 'otobi.id',
    timestamp,
    generatedAt: new Date().toISOString(),
    tables: results,
    totalRows: results.reduce((sum, r) => sum + r.count, 0),
    totalSize: formatSize(results.reduce((sum, r) => sum + r.size, 0)),
  };

  fs.writeFileSync(
    path.join(backupDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // ── Summary ────────────────────────────────────────────────

  const totalRows = manifest.totalRows;
  const errors = results.filter((r) => r.status === 'ERROR');

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`✅  Backup selesai!`);
  console.log(`📊  Total: ${totalRows} rows | ${manifest.totalSize}`);
  console.log(`📁  Lokasi: backups/backup_${timestamp}/`);
  if (errors.length > 0) {
    console.log(`⚠️   ${errors.length} tabel gagal: ${errors.map((e) => e.table).join(', ')}`);
  }
  console.log(`${'─'.repeat(50)}\n`);
}

backup()
  .catch((err) => {
    console.error('\n❌ Backup gagal:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
