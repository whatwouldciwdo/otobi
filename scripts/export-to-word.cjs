// =============================================================
// Export Restore Guide → restore-guide.docx
// Usage: node scripts/export-to-word.cjs
// =============================================================

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, convertInchesToTwip,
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ── Warna brand ───────────────────────────────────────────────
const COLOR = {
  primary:    '1a1a2e',
  accent:     'e63946',
  heading1:   '16213e',
  heading2:   '0f3460',
  heading3:   '1a1a2e',
  tableHead:  '16213e',
  tableAlt:   'f0f4ff',
  white:      'FFFFFF',
  lightGray:  'f5f5f5',
  border:     'cccccc',
  warn:       'fff3cd',
  tip:        'e8f5e9',
  important:  'fdecea',
  note:       'e3f2fd',
};

// ── Helpers ───────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    run: { bold: true, color: COLOR.heading1, size: 36 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    run: { bold: true, color: COLOR.heading2, size: 28 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    run: { bold: true, color: COLOR.heading3, size: 24 },
  });
}

function p(runs, spacing = {}) {
  const children = (typeof runs === 'string')
    ? [new TextRun({ text: runs, size: 22 })]
    : runs;
  return new Paragraph({ children, spacing: { after: 140, ...spacing } });
}

function bold(text, color) {
  return new TextRun({ text, bold: true, size: 22, color: color || COLOR.heading1 });
}

function code(text) {
  return new TextRun({
    text,
    font: 'Courier New',
    size: 20,
    color: 'c0392b',
    shading: { type: ShadingType.CLEAR, fill: 'f4f4f4', color: 'f4f4f4' },
  });
}

function codeBlock(lines) {
  return lines.map((line) =>
    new Paragraph({
      children: [new TextRun({
        text: line,
        font: 'Courier New',
        size: 20,
        color: 'abb2bf',
      })],
      spacing: { after: 0 },
      shading: { type: ShadingType.CLEAR, fill: '282c34', color: '282c34' },
      indent: { left: convertInchesToTwip(0.3), right: convertInchesToTwip(0.3) },
    })
  );
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { after: 80 },
  });
}

function callout(label, text, bgColor) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}  `, bold: true, size: 22 }),
      new TextRun({ text, size: 22 }),
    ],
    spacing: { before: 120, after: 120 },
    indent: { left: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.CLEAR, fill: bgColor, color: bgColor },
  });
}

function divider() {
  return new Paragraph({
    text: '─'.repeat(70),
    spacing: { before: 160, after: 160 },
    run: { color: COLOR.border, size: 16 },
  });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map((txt, i) =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: String(txt),
            bold: isHeader,
            color: isHeader ? COLOR.white : COLOR.heading1,
            size: isHeader ? 22 : 21,
          })],
          alignment: AlignmentType.LEFT,
        })],
        shading: isHeader
          ? { type: ShadingType.CLEAR, fill: COLOR.tableHead }
          : (i % 2 === 0 ? undefined : { type: ShadingType.CLEAR, fill: COLOR.tableAlt }),
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        width: { size: Math.floor(9000 / cells.length), type: WidthType.DXA },
      })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map((r) => tableRow(r)),
    ],
    margins: { top: 80, bottom: 80 },
  });
}

// ── Konten Dokumen ────────────────────────────────────────────

function buildDocument() {
  const children = [

    // ── Cover ─────────────────────────────────────────────
    new Paragraph({
      children: [new TextRun({
        text: '🔄  OTOBI — Panduan Restore Database & Storage',
        bold: true,
        size: 44,
        color: COLOR.heading1,
      })],
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({
        text: `Dokumen ini menjelaskan cara merestore data OTOBI dari backup (database JSON + gambar Supabase Storage) secara lengkap dan aman.`,
        size: 22,
        color: '555555',
        italics: true,
      })],
      spacing: { after: 160 },
    }),

    callout('⚠️  PENTING:', 'Restore akan menghapus semua data saat ini di database dan menggantinya dengan data dari backup. Lakukan hanya jika memang diperlukan.', COLOR.warn),

    divider(),

    // ── Kapan Perlu Restore ────────────────────────────────
    h2('Kapan Perlu Restore?'),
    makeTable(
      ['Situasi', 'Perlu Restore?'],
      [
        ['Data produk / blog terhapus tidak sengaja', '✅ Ya'],
        ['Database corrupt / error fatal', '✅ Ya'],
        ['Pindah ke Supabase project baru', '✅ Ya'],
        ['Website error tapi data aman', '❌ Tidak perlu'],
        ['Ingin lihat isi backup saja', '❌ Cukup buka file JSON'],
      ]
    ),

    new Paragraph({ text: '', spacing: { after: 240 } }),
    divider(),

    // ── Pra-syarat ─────────────────────────────────────────
    h2('Sebelum Mulai — Cek Daftar Backup'),
    p('Buka terminal di folder project, jalankan:'),
    ...codeBlock(['Get-ChildItem backups\\ -Directory | Sort-Object Name -Descending']),
    new Paragraph({ text: '', spacing: { after: 120 } }),
    p('Output contoh:'),
    ...codeBlock([
      'backup_2026-05-11_12-34-12   ← paling baru (FULL: 79 rows + 115 gambar)',
      'backup_2026-05-11_12-33-38',
      'backup_2026-05-11_12-23-41',
    ]),
    new Paragraph({ text: '', spacing: { after: 200 } }),
    p([bold('Pilih folder backup yang paling baru'), new TextRun({ text: ' atau yang ingin kamu restore.', size: 22 })]),

    divider(),

    // ── STEP 1 ─────────────────────────────────────────────
    h2('STEP 1 — Pastikan Project Siap'),
    p('Buka terminal di folder otomobi-web, lalu cek file .env:'),
    ...codeBlock(['Get-Content .env | Select-String "DATABASE_URL"']),
    new Paragraph({ text: '', spacing: { after: 120 } }),
    p('Harus muncul:'),
    ...codeBlock(['DATABASE_URL="postgresql://postgres.xxx..."']),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    callout('⚠️  WARNING:', 'Jika .env tidak ada, restore tidak bisa jalan. Copy dari .env.example lalu isi ulang kredensial.', COLOR.warn),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── STEP 2 ─────────────────────────────────────────────
    h2('STEP 2 — Lihat Isi Manifest Backup (Opsional)'),
    p('Cek dulu isi backup sebelum restore untuk memastikan backup-nya benar:'),
    ...codeBlock(['Get-Content backups\\backup_2026-05-11_12-34-12\\manifest.json']),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    p('Pastikan terlihat:'),
    bullet('"totalRows" → jumlah baris data (harus > 0)'),
    bullet('"totalFiles" → jumlah gambar (harusnya 115)'),
    bullet('"generatedAt" → tanggal backup dibuat'),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── STEP 3 ─────────────────────────────────────────────
    h2('STEP 3 — Jalankan Restore (Dry Run Dulu)'),
    p('Jalankan TANPA --confirm dulu untuk melihat preview:'),
    ...codeBlock(['node scripts/restore-db.cjs backups/backup_2026-05-11_12-34-12']),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    callout('ℹ️  CATATAN:', 'Ini aman — belum ada yang berubah. Script hanya preview saja.', COLOR.note),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── STEP 4 ─────────────────────────────────────────────
    h2('STEP 4 — Jalankan Restore Sesungguhnya'),
    p('Setelah yakin, tambahkan --confirm:'),
    ...codeBlock([
      'node scripts/restore-db.cjs backups/backup_2026-05-11_12-34-12 --confirm',
    ]),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    p('Atau pakai shortcut npm:'),
    ...codeBlock([
      'npm run restore -- backups/backup_2026-05-11_12-34-12 --confirm',
    ]),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    p('Proses yang akan berjalan:'),
    bullet('Hapus semua data lama (users, products, blogs, dll)'),
    bullet('Insert ulang dari file JSON backup'),
    bullet('Upload ulang semua gambar ke Supabase Storage'),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    callout('💡  TIP:', 'Restore gambar memakan waktu beberapa menit tergantung kecepatan internet. Jangan tutup terminal.', COLOR.tip),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── STEP 5 ─────────────────────────────────────────────
    h2('STEP 5 — Verifikasi Setelah Restore'),
    p('Setelah restore selesai, jalankan dev server:'),
    ...codeBlock(['npm run dev']),
    new Paragraph({ text: '', spacing: { after: 140 } }),
    p('Lalu buka browser dan cek:'),
    bullet('http://localhost:3000 → halaman utama tampil dengan produk'),
    bullet('http://localhost:3000/admin → login admin, cek produk & blog ada'),
    bullet('http://localhost:3000/blog → artikel blog muncul'),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── Skenario Khusus ────────────────────────────────────
    h2('Skenario Khusus: Pindah ke Supabase Project Baru'),
    p('Jika kamu ganti Supabase project (misal akun baru), lakukan ini sebelum restore:'),

    h3('1. Update .env dengan kredensial baru'),
    ...codeBlock([
      'DATABASE_URL="postgresql://postgres.NEW_ID:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"',
      'NEXT_PUBLIC_SUPABASE_URL=https://NEW_ID.supabase.co',
      'SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  ← service role key baru',
    ]),

    new Paragraph({ text: '', spacing: { after: 160 } }),
    h3('2. Push schema database dulu'),
    ...codeBlock(['npx prisma db push']),

    new Paragraph({ text: '', spacing: { after: 160 } }),
    h3('3. Buat ulang bucket Storage di Supabase Dashboard'),
    bullet('Buka Supabase → Storage → New Bucket'),
    bullet('Buat bucket bernama uploads (centang Public)'),
    bullet('Buat bucket bernama otobi (centang Public)'),

    new Paragraph({ text: '', spacing: { after: 160 } }),
    h3('4. Baru jalankan restore'),
    ...codeBlock([
      'node scripts/restore-db.cjs backups/backup_2026-05-11_12-34-12 --confirm',
    ]),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    divider(),

    // ── Referensi Cepat ────────────────────────────────────
    h2('Referensi Cepat'),
    makeTable(
      ['Perintah', 'Fungsi'],
      [
        ['npm run backup', 'Buat backup baru (DB + gambar)'],
        ['node scripts/restore-db.cjs backups/backup_XXX', 'Preview restore (aman, tidak mengubah apapun)'],
        ['node scripts/restore-db.cjs backups/backup_XXX --confirm', 'Eksekusi restore sesungguhnya'],
        ['Get-ChildItem backups\\ -Directory', 'Lihat daftar semua backup yang tersedia'],
      ]
    ),

    new Paragraph({ text: '', spacing: { after: 200 } }),
    callout('🚫  CAUTION:', 'Jangan jalankan restore di tengah jam sibuk. Website akan mengalami downtime singkat selama proses berlangsung (1–3 menit database + waktu upload gambar).', COLOR.important),

    new Paragraph({ text: '', spacing: { after: 400 } }),
    new Paragraph({
      children: [new TextRun({
        text: `Dokumen dibuat otomatis oleh sistem backup OTOBI — ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        size: 18,
        color: '999999',
        italics: true,
      })],
      alignment: AlignmentType.CENTER,
    }),
  ];

  return new Document({
    creator: 'OTOBI Backup System',
    title:   'Panduan Restore OTOBI',
    subject: 'Database & Storage Restore Guide',
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1),
            right:  convertInchesToTwip(1.2),
            bottom: convertInchesToTwip(1),
            left:   convertInchesToTwip(1.2),
          },
        },
      },
      children,
    }],
  });
}

// ── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('\n📄 Membuat file Word...');
  const doc    = buildDocument();
  const buffer = await Packer.toBuffer(doc);
  const outDir  = path.join(__dirname, '../backups');
  const outPath = path.join(outDir, 'OTOBI-Restore-Guide.docx');

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, buffer);

  const size = (buffer.length / 1024).toFixed(1);
  console.log(`✅  Berhasil! File disimpan di:`);
  console.log(`    backups/OTOBI-Restore-Guide.docx  (${size} KB)\n`);
}

main().catch((err) => {
  console.error('❌ Gagal:', err.message);
  process.exit(1);
});
