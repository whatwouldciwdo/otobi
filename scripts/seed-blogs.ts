/**
 * Seed script: Dummy Blog Articles for Otobi
 * Run with: npx ts-node --skip-project scripts/seed-blogs.ts
 *   OR:     npx tsx scripts/seed-blogs.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── HELPER ────────────────────────────────────────────────────────────────
function makeId() {
  return `blog_seed_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

// ─── ARTICLE DATA ──────────────────────────────────────────────────────────
const articles = [
  // ─── 1 ──────────────────────────────────────────────────────────────────
  {
    id: makeId(),
    title: "Cara Merawat Cat Mobil agar Tetap Mengkilap Sepanjang Tahun",
    slug: "cara-merawat-cat-mobil-tetap-mengkilap",
    excerpt:
      "Cat mobil yang kusam dan baret halus bisa dicegah dengan rutinitas perawatan yang tepat. Pelajari langkah-langkah ilmiah merawat cat mobil agar tampil kilap seperti baru sepanjang tahun.",
    author: "Tim Otobi",
    isPublished: 1,
    image: null,
    content: `
<h2>Mengapa Cat Mobil Cepat Kusam?</h2>
<p>Cat mobil Anda setiap hari terpapar sinar UV, polusi udara, debu aspal, kotoran burung, dan hujan asam. Tanpa perlindungan yang tepat, lapisan <em>clear coat</em> — lapisan transparan pelindung terluar — akan terdegradasi perlahan hingga cat terlihat kusam, berminyak, dan penuh baret mikro (swirl marks).</p>
<p>Kabar baiknya: dengan rutinitas yang benar, kondisi cat mobil Anda bisa dipertahankan bahkan selama bertahun-tahun tanpa perlu respray mahal.</p>

<h2>1. Cuci Mobil dengan Teknik Two-Bucket Method</h2>
<p>Kesalahan terbesar yang mempercepat baret halus adalah cara mencuci yang salah. Teknik <em>two-bucket method</em> adalah standar emas para detailer profesional:</p>
<ul>
  <li><strong>Ember pertama</strong>: berisi air sabun (car shampoo pH-neutral).</li>
  <li><strong>Ember kedua</strong>: berisi air bersih untuk membilas kain sebelum kembali ke ember sabun.</li>
</ul>
<p>Selalu gunakan <strong>sarung tangan cuci microfiber</strong> (wash mitt) berkualitas, bukan spons biasa yang menjebak pasir dan menggores cat.</p>

<h2>2. Gunakan Car Shampoo pH-Neutral, Bukan Sabun Cuci Piring</h2>
<p>Sabun cuci piring memang berbusa banyak, tapi formulanya bersifat basa kuat yang merusak wax, sealant, dan bahkan clear coat jika digunakan berulang. Selalu pilih car shampoo dengan label <em>pH-neutral (pH 6–8)</em> yang diformulasikan khusus untuk permukaan cat otomotif.</p>

<h2>3. Decontamination: Langkah yang Sering Dilewatkan</h2>
<p>Setelah dicuci, permukaan cat masih menyimpan kontaminan yang tidak terlihat: serpihan rem besi, overspray cat, dan tar aspal. Gunakan:</p>
<ul>
  <li><strong>Iron remover</strong>: spray pada panel basah, tunggu 2–3 menit hingga berubah ungu, lalu bilas.</li>
  <li><strong>Clay bar</strong>: gosok pada permukaan yang sudah diberi lubrikasi untuk mengangkat kotoran tertempel. Cat akan terasa halus seperti kaca setelah proses ini.</li>
</ul>

<h2>4. Poles dan Proteksi: Wax vs. Sealant vs. Coating</h2>
<p>Setelah cat bersih dan halus, butuh lapisan pelindung:</p>
<ul>
  <li><strong>Carnauba Wax</strong>: kilap dalam hangat dan natural, tapi bertahan 1–3 bulan.</li>
  <li><strong>Paint Sealant</strong>: perlindungan sintetis lebih tahan lama (4–6 bulan).</li>
  <li><strong>Nano Coating / Ceramic Coating</strong>: perlindungan paling superior, bertahan 1–5 tahun, tahan air, kimia, dan baret mikro.</li>
</ul>

<blockquote>Untuk mobil harian di perkotaan Indonesia yang terpapar polusi dan hujan asam tinggi, kami rekomendasikan minimal menggunakan <strong>paint sealant setiap 4 bulan</strong> sebagai lapisan dasar proteksi.</blockquote>

<h2>5. Rutinitas Perawatan Mingguan</h2>
<p>Buat jadwal sederhana ini agar cat mobil Anda selalu prima:</p>
<ul>
  <li>Setiap minggu: Cuci dengan dua ember + microfiber wash mitt.</li>
  <li>Setiap bulan: Quick detailer spray untuk menambah kilap dan sedikit perlindungan.</li>
  <li>Setiap 4–6 bulan: Proses clay bar + aplikasi sealant atau wax.</li>
  <li>Setiap 1–2 tahun: Polishing ringan untuk menghilangkan swirl marks + reaplikasi coating.</li>
</ul>

<h2>Kesimpulan</h2>
<p>Merawat cat mobil bukan sekadar soal penampilan — ini soal mempertahankan nilai jual kendaraan Anda. Dengan investasi waktu dan produk yang tepat, cat mobil Anda akan tetap terlihat mengkilap dan terlindungi dari segala cuaca. Otobi menyediakan lengkap semua yang Anda butuhkan, dari car shampoo, clay bar, hingga nano coating profesional.</p>
    `,
    metaTitle: "Cara Merawat Cat Mobil agar Tetap Mengkilap | Otobi",
    metaDescription: "Panduan lengkap merawat cat mobil agar tetap mengkilap: two-bucket method, decontamination, wax vs ceramic coating. Tips profesional dari tim Otobi.",
    keywords: "cara merawat cat mobil, cat mobil mengkilap, ceramic coating, car shampoo pH neutral, clay bar mobil",
  },

  // ─── 2 ──────────────────────────────────────────────────────────────────
  {
    id: makeId(),
    title: "Ceramic Coating vs Wax: Mana yang Lebih Baik untuk Proteksi Mobil Anda?",
    slug: "ceramic-coating-vs-wax-perbandingan-lengkap",
    excerpt:
      "Ceramic coating dan wax adalah dua pilihan proteksi cat yang populer. Tapi mana yang lebih worth it untuk kondisi berkendara di Indonesia? Kami bandingkan secara lengkap dan jujur.",
    author: "Tim Otobi",
    isPublished: 1,
    image: null,
    content: `
<h2>Apa Itu Wax?</h2>
<p><strong>Carnauba wax</strong> adalah zat alami yang berasal dari daun pohon palem Brasil. Wax sudah digunakan sejak era 1900-an sebagai pelindung cat dan penghasil kilap. Sifatnya hangat, memberikan kilap yang terkesan "basah" dan organik — banyak kolektor mobil klasik menyukainya.</p>
<p>Wax tersedia dalam bentuk padat (paste), semi-cair, maupun spray. Cara aplikasinya relatif mudah dan bisa dilakukan siapa saja di rumah.</p>

<h2>Apa Itu Ceramic Coating?</h2>
<p><strong>Ceramic coating</strong> (atau nano coating) adalah teknologi perlindungan berbasis <em>Silicon Dioxide (SiO2)</em> atau <em>Titanium Dioxide (TiO2)</em>. Ketika diaplikasikan, coating membentuk lapisan tipis yang menyatu secara kimiawi dengan clear coat, menciptakan permukaan keras dan hydrophobic (anti-air).</p>

<h2>Perbandingan Langsung</h2>

<h3>1. Daya Tahan</h3>
<ul>
  <li><strong>Wax</strong>: 1–3 bulan (bahkan lebih cepat jika terkena hujan dan panas berulang).</li>
  <li><strong>Ceramic Coating</strong>: 1–5 tahun tergantung kualitas produk dan perawatan.</li>
</ul>

<h3>2. Perlindungan terhadap Goresan</h3>
<ul>
  <li><strong>Wax</strong>: Perlindungan minimal — baret halus masih bisa terjadi.</li>
  <li><strong>Ceramic Coating</strong>: Hardness 9H membuat permukaan jauh lebih tahan terhadap baret mikro, debu, dan kerikil kecil.</li>
</ul>

<h3>3. Efek Hydrophobic (Anti-Air)</h3>
<ul>
  <li><strong>Wax</strong>: Efek beading ada, tapi memudar dalam beberapa minggu.</li>
  <li><strong>Ceramic Coating</strong>: Water beading sangat kuat dan konsisten. Air langsung menggelinding membawa kotoran bersamanya.</li>
</ul>

<h3>4. Harga dan Kemudahan Aplikasi</h3>
<ul>
  <li><strong>Wax</strong>: Lebih murah, bisa DIY di rumah, ideal untuk perawatan rutin.</li>
  <li><strong>Ceramic Coating</strong>: Lebih mahal, idealnya dikerjakan oleh detailer profesional (permukaan harus decontaminated sempurna sebelum aplikasi).</li>
</ul>

<blockquote>Kesimpulan: Ceramic coating unggul hampir di semua aspek teknis. Namun untuk anggaran terbatas atau sebagai lapisan top-up di atas coating yang ada, wax tetap pilihan yang valid dan mudah.</blockquote>

<h2>Rekomendasi Otobi</h2>
<p>Untuk proteksi maksimal di iklim tropis Indonesia yang panas, lembab, dan penuh hujan asam:</p>
<ul>
  <li>Gunakan <strong>ceramic coating</strong> sebagai lapisan utama proteksi jangka panjang.</li>
  <li>Tambahkan <strong>ceramic topper spray</strong> setiap 2–3 bulan untuk memperbarui efek hydrophobic dan kilap.</li>
  <li>Hindari wax di atas ceramic coating — wax bisa menyumbat pori-pori coating dan mengurangi performa ketahanannya.</li>
</ul>
    `,
    metaTitle: "Ceramic Coating vs Wax: Perbandingan Lengkap untuk Mobil Indonesia | Otobi",
    metaDescription: "Bandingkan ceramic coating vs wax untuk proteksi cat mobil: daya tahan, ketahanan goresan, efek hydrophobic, dan harga. Mana yang lebih baik?",
    keywords: "ceramic coating vs wax, ceramic coating mobil, carnauba wax, proteksi cat mobil, nano coating Indonesia",
  },

  // ─── 3 ──────────────────────────────────────────────────────────────────
  {
    id: makeId(),
    title: "Panduan Lengkap Detailing Interior Mobil: Dari Dashboard hingga Jok",
    slug: "panduan-detailing-interior-mobil-lengkap",
    excerpt:
      "Interior yang bersih bukan hanya soal estetika — ini soal kesehatan dan kenyamanan berkendara. Pelajari cara detailing interior mobil secara profesional dari A sampai Z.",
    author: "Tim Otobi",
    isPublished: 1,
    image: null,
    content: `
<h2>Mengapa Interior Butuh Perhatian Khusus?</h2>
<p>Interior mobil adalah ruang yang paling sering kita sentuh namun paling jarang dibersihkan secara benar. Debu, kuman, jamur, dan aroma tidak sedap bisa menumpuk di sela-sela jok, karpet, dan ventilasi AC — mempengaruhi kualitas udara yang kita hirup setiap hari.</p>
<p>Detailing interior yang baik tidak hanya membuat kabin terlihat baru, tapi juga menghilangkan alergen dan bakteri yang tidak terlihat.</p>

<h2>Alat dan Produk yang Dibutuhkan</h2>
<ul>
  <li>Vacuum cleaner dengan berbagai attachment</li>
  <li>Kuas detailing berbagai ukuran (untuk sela-sela sempit)</li>
  <li>Microfiber cloth (minimal 5 lembar)</li>
  <li>Interior cleaner/APC (All-Purpose Cleaner) pH-neutral</li>
  <li>Dashboard protectant (anti UV)</li>
  <li>Foam seat cleaner / fabric cleaner</li>
  <li>Leather conditioner (untuk jok kulit)</li>
  <li>Air freshener atau ozone generator</li>
</ul>

<h2>Langkah 1: Vacuum Total</h2>
<p>Mulailah dengan memvacuum seluruh interior — karpet, sela-sela jok, bagasi, dan ventilasi AC. Gunakan attachment sempit untuk menjangkau area di bawah kursi dan antara konsol dan kursi. Jangan lewatkan sabuk pengaman dan sela-sela di sekitar shifter.</p>

<h2>Langkah 2: Bersihkan Dashboard dan Panel Pintu</h2>
<p>Semprotkan interior cleaner pada microfiber cloth (bukan langsung ke panel — risiko masuk ke elektronik). Lap perlahan dengan gerakan satu arah. Gunakan kuas kecil untuk sela-sela tombol, speaker grill, dan ventilasi AC.</p>
<p>Setelah bersih, aplikasikan <strong>dashboard protectant berbasis air</strong> (hindari yang silicone-based karena licin dan menarik debu). Produk berbasis air memberi perlindungan UV tanpa efek berminyak.</p>

<h2>Langkah 3: Detail Jok</h2>
<h3>Jok Fabric/Kain</h3>
<p>Semprotkan foam fabric cleaner, gosok perlahan dengan kuas lembut, lalu angkat busa dan kotoran dengan microfiber kering. Untuk noda membandel, ulangi proses atau gunakan steam cleaner.</p>

<h3>Jok Kulit (Leather)</h3>
<p>Gunakan leather cleaner khusus — jangan pakai produk all-purpose karena bisa merusak kondisi kulit. Setelah bersih, <strong>wajib</strong> aplikasikan leather conditioner untuk mencegah kulit retak dan kering akibat panas.</p>

<h2>Langkah 4: Kaca Interior</h2>
<p>Kaca dalam sering meninggalkan lapisan film berminyak dari uap plastik interior (off-gassing). Bersihkan dengan glass cleaner dan microfiber khusus kaca — lap dalam dua tahap: pertama dengan kain lembab, kedua dengan kain kering untuk menghilangkan streak.</p>

<h2>Langkah 5: Eliminasi Bau</h2>
<p>Jika aroma tidak sedap masih tersisa setelah vakum dan pembersihan, opsinya:</p>
<ul>
  <li><strong>Ozone generator</strong>: cara paling efektif, membunuh bakteri dan jamur penyebab bau.</li>
  <li><strong>Baking soda</strong>: tabur pada karpet, diamkan semalam, lalu vacuum.</li>
  <li><strong>Air freshener bomb</strong>: untuk masking aroma sementara.</li>
</ul>

<blockquote>Detailing interior sebaiknya dilakukan minimal setiap 3 bulan. Untuk pengguna yang aktif dan sering membawa makanan atau anak-anak, lakukan setiap 6 minggu untuk menjaga kebersihan optimal.</blockquote>

<h2>Produk Rekomendasi Otobi untuk Interior</h2>
<p>Otobi menyediakan rangkaian produk interior care yang sudah teruji: interior cleaner APC pH-neutral, leather conditioner premium, foam fabric cleaner, dashboard protectant anti-UV, dan berbagai kuas detailing profesional. Semua produk dipilih berdasarkan standar profesional detailer.</p>
    `,
    metaTitle: "Panduan Detailing Interior Mobil: Dashboard, Jok, hingga Karpet | Otobi",
    metaDescription: "Panduan lengkap detailing interior mobil: vacuum, bersihkan dashboard, jok fabric dan kulit, kaca dalam, hingga eliminasi bau. Cara detailer profesional.",
    keywords: "detailing interior mobil, cara bersihkan interior mobil, leather conditioner, dashboard protectant, foam cleaner jok",
  },

  // ─── 4 ──────────────────────────────────────────────────────────────────
  {
    id: makeId(),
    title: "5 Kesalahan Fatal Saat Mencuci Mobil yang Merusak Cat Tanpa Disadari",
    slug: "kesalahan-fatal-saat-mencuci-mobil",
    excerpt:
      "Mencuci mobil terlihat sederhana, tapi ada 5 kesalahan umum yang justru merusak cat secara perlahan. Apakah Anda masih melakukan salah satunya?",
    author: "Tim Otobi",
    isPublished: 1,
    image: null,
    content: `
<h2>Mencuci Mobil Bisa Merusak Cat?</h2>
<p>Ya — jika dilakukan dengan cara yang salah. Cat mobil memiliki lapisan <em>clear coat</em> setebal hanya sekitar 50–100 mikron. Proses mencuci yang abrasif bisa menciptakan ribuan baret mikro (<em>swirl marks</em>) yang membuat cat terlihat kusam dan tidak mengkilap saat terkena cahaya.</p>

<h2>Kesalahan #1: Menggunakan Spons Biasa</h2>
<p>Spons pori-pori besar menjebak pasir dan kotoran di permukaannya, lalu menggeseknya kembali ke cat — seperti amplas halus. Ganti dengan <strong>wash mitt microfiber</strong> yang serat panjangnya mendorong kotoran jauh dari permukaan cat, bukan menggesernya.</p>

<h2>Kesalahan #2: Satu Ember untuk Segalanya</h2>
<p>Menggunakan satu ember artinya setiap kali Anda mencelup wash mitt, Anda mengambil kembali kotoran yang sudah diangkat dari cat. Gunakan teknik <strong>two-bucket method</strong>: satu ember sabun, satu ember air bilas. Tambahkan <em>grit guard</em> di dasar ember untuk menjebak kotoran di bawah.</p>

<h2>Kesalahan #3: Mencuci di Bawah Terik Matahari</h2>
<p>Mencuci saat matahari terik menyebabkan sabun dan air mengering terlalu cepat — meninggalkan water spots (noda air mineral) yang sulit dihilangkan dan berpotensi merusak clear coat jika dibiarkan. Cuci di tempat teduh, di pagi hari sebelum jam 9, atau sore setelah jam 4.</p>

<h2>Kesalahan #4: Menyeka dengan Handuk Biasa atau Kain Bekas</h2>
<p>Handuk cotton terry biasa atau lap kain bekas memiliki serat kasar yang menyebabkan baret. Selalu gunakan <strong>microfiber drying towel</strong> yang lembut dan daya serap tinggi. Tepuk-tepuk permukaan (blot), jangan digosok.</p>

<h2>Kesalahan #5: Jarang Ganti Air dan Sabun Cuci</h2>
<p>Air sabun yang sudah gelap artinya sudah penuh kotoran dan pasir. Begitu juga wash mitt yang tidak dibilas cukup sering. Ganti air sabun jika sudah keruh dan selalu bilas wash mitt di ember kedua sebelum kembali ke panel berikutnya.</p>

<blockquote>Satu sesi cuci yang salah mungkin tidak langsung terlihat merusaknya. Tapi 50 kali mencuci dengan cara yang salah menghasilkan baret mikro (swirl marks) yang hanya bisa diperbaiki dengan polishing — butuh waktu dan biaya ekstra.</blockquote>

<h2>Tips Tambahan</h2>
<ul>
  <li>Cuci dari atas ke bawah — bagian bawah adalah yang paling kotor, jadi selalu dikerjakan terakhir.</li>
  <li>Bersihkan juga roda dan ban menggunakan kuas dan shampoo khusus wheel — produk cat mobil tidak cocok untuk velg alloy.</li>
  <li>Setelah dicuci, aplikasikan quick detailer untuk menambah sedikit proteksi dan kilap.</li>
</ul>
    `,
    metaTitle: "5 Kesalahan Fatal Mencuci Mobil yang Merusak Cat | Otobi",
    metaDescription: "Hindari 5 kesalahan ini saat mencuci mobil: pakai spons biasa, satu ember, cuci di bawah matahari, lap biasa, dan air kotor. Tips dari profesional Otobi.",
    keywords: "kesalahan mencuci mobil, two bucket method, wash mitt microfiber, swirl marks mobil, cara mencuci mobil yang benar",
  },

  // ─── 5 ──────────────────────────────────────────────────────────────────
  {
    id: makeId(),
    title: "Mengenal Lap Microfiber: Panduan Memilih yang Tepat untuk Setiap Kebutuhan Detailing",
    slug: "panduan-memilih-lap-microfiber-detailing",
    excerpt:
      "Tidak semua lap microfiber sama. Ketebalan, GSM, dan jenis serat menentukan apakah kain itu cocok untuk detailing cat, mengeringkan, atau membersihkan kaca. Pelajari cara memilihnya.",
    author: "Tim Otobi",
    isPublished: 1,
    image: null,
    content: `
<h2>Apa Itu Microfiber?</h2>
<p>Microfiber adalah serat sintetis ultra-halus, biasanya campuran polyester dan polyamide (nilon), dengan diameter serat jauh lebih kecil dari rambut manusia. Sifat kapilernya membuatnya sangat efektif menyerap cairan dan mengangkat kotoran tanpa menggesek permukaan.</p>
<p>Dalam dunia detailing otomotif, microfiber adalah alat <em>paling penting</em> — sekalipun produk kimianya terbaik, jika kainnya salah, hasilnya tidak optimal dan bahkan bisa merusak cat.</p>

<h2>Memahami GSM (Gram per Square Meter)</h2>
<p>GSM adalah ukuran ketebalan dan densitas serat microfiber. Semakin tinggi GSM, semakin tebal dan lembut kainnya:</p>
<ul>
  <li><strong>200–350 GSM</strong>: Tipis, cocok untuk aplikasi coating, sealant, atau quick detailer.</li>
  <li><strong>350–500 GSM</strong>: Serbaguna — cocok untuk mengelap cat, panel, dan kaca.</li>
  <li><strong>500–800 GSM</strong>: Tebal dan mewah, ideal untuk mengeringkan bodi mobil dengan aman.</li>
  <li><strong>800+ GSM</strong>: Sangat tebal, biasa disebut "plush" towel untuk pengeringan premium.</li>
</ul>

<h2>Jenis Microfiber dan Kegunaannya</h2>

<h3>1. Waffle Weave Drying Towel</h3>
<p>Pola weave berlapis-lapis meningkatkan kapasitas penyerapan air secara dramatis. Ideal untuk mengeringkan bodi setelah cuci — mampu menyerap jauh lebih banyak air dibanding towel biasa.</p>

<h3>2. Plush Pile Towel</h3>
<p>Serat panjang yang sangat lembut — digunakan untuk akhir pengolesan wax, sealant, atau quick detailer. Tidak meninggalkan noda atau baret bahkan pada cat yang paling sensitif sekalipun.</p>

<h3>3. Edgeless Microfiber</h3>
<p>Tidak memiliki tepi jahitan keras. Aman digunakan pada permukaan cat yang sering kontak dengan tepi kain. Cocok untuk polish, wax, dan area dekat sela panel.</p>

<h3>4. Glass Microfiber</h3>
<p>Serat halus ultra-ringan khusus untuk kaca — tidak meninggalkan lint atau serat tersisa di kaca. Hasilkan hasil bebas streak pada windshield dan kaca samping.</p>

<h3>5. Wash Mitt Microfiber</h3>
<p>Sarung tangan berbulu lebat — dirancang untuk mencuci bodi mobil. Serat panjangnya mengangkat kotoran ke atas, jauh dari permukaan cat.</p>

<h2>Cara Merawat Microfiber agar Tahan Lama</h2>
<ul>
  <li>Cuci terpisah dari kain lain — serat microfiber menarik lint dari cotton.</li>
  <li>Gunakan detergen lembut tanpa pelembut fabric (fabric softener melapisi serat dan mengurangi daya serap).</li>
  <li>Jangan gunakan pemutih.</li>
  <li>Keringkan dengan suhu rendah atau angin-anginkan — panas tinggi bisa meleburkan serat sintetis.</li>
  <li>Simpan terpisah dari produk kimia kasar.</li>
</ul>

<blockquote>Investasi pada microfiber berkualitas tinggi adalah investasi yang melindungi cat mobil Anda. Microfiber murah sering menggunakan campuran serat kasar yang justru menimbulkan baret halus pada clear coat.</blockquote>

<h2>Produk Microfiber Pilihan di Otobi</h2>
<p>Otobi mengkurasi koleksi microfiber dari brand-brand terpercaya: dari wash mitt untuk cuci harian, edgeless towel untuk aplikasi coating, hingga waffle weave drying towel berkapasitas super absorb. Semua tersedia di toko kami dengan garansi kualitas detailer profesional.</p>
    `,
    metaTitle: "Panduan Memilih Lap Microfiber untuk Detailing Mobil | Otobi",
    metaDescription: "Tidak semua microfiber sama. Pelajari GSM, jenis (waffle weave, plush, edgeless), dan fungsi setiap towel microfiber untuk detailing mobil yang aman dan sempurna.",
    keywords: "lap microfiber detailing, GSM microfiber, waffle weave drying towel, edgeless microfiber, wash mitt microfiber",
  },
];

// ─── SEED ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding dummy blog articles...\n");

  for (const article of articles) {
    // Check if slug already exists
    const existing = await prisma.blog.findUnique({ where: { slug: article.slug } });
    if (existing) {
      console.log(`  ⚠️  Already exists (slug: "${article.slug}") — skipped.`);
      continue;
    }

    try {
      await prisma.blog.create({
        data: {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content.trim(),
          image: article.image ?? null,
          author: article.author,
          isPublished: true,
        },
      });
      console.log(`  ✅ Created: "${article.title}"`);
    } catch (e: any) {
      console.error(`  ❌ Failed "${article.title}":`, e.message?.split("\n")[0]);
    }
  }

  console.log("\n✨ Done seeding blog articles!");
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  await pool.end();
  process.exit(1);
});
