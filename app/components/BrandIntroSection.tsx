import styles from './BrandIntroSection.module.css';

const stats = [
    { value: '10+', label: 'Tahun Pengalaman' },
    { value: '5.000+', label: 'Kendaraan Dirawat' },
    { value: '9H+', label: 'Kekerasan Coating' },
    { value: '100%', label: 'Kepuasan Klien' },
];

export default function BrandIntroSection() {
    return (
        <section className={styles.section} id="tentang-otobi">
            <div className={styles.container}>

                
                <div className={styles.topDivider}>
                    <span className={styles.dividerLine} />
                    <span className={styles.dividerLabel}>TENTANG KAMI</span>
                    <span className={styles.dividerLine} />
                </div>

                <div className={styles.grid}>
                    
                    <div className={styles.leftCol}>
                        <h1 className={styles.headline}>
                            OTOBI Car Care —<br />
                            <span className={styles.headlineAccent}>Standar Tertinggi</span><br />
                            Perawatan Mobil di Jakarta.
                        </h1>
                    </div>

                    
                    <div className={styles.rightCol}>
                        <p className={styles.lead}>
                            Otobi hadir sebagai destinasi utama bagi pemilik kendaraan yang menuntut kualitas terbaik. Kami bukan sekadar tempat cuci mobil — kami adalah studio perawatan kendaraan premium yang memperlakukan setiap mobil seperti karya seni.
                        </p>
                        <p className={styles.body}>
                            Berlokasi di Jakarta, OTOBI Car Care menyediakan layanan lengkap mulai dari <strong>auto detailing</strong>, <strong>nano ceramic coating 9H+</strong>, <strong>paint correction</strong>, <strong>interior detailing</strong>, hingga pemasangan <strong>Paint Protection Film (PPF)</strong>. Setiap proses dikerjakan oleh teknisi bersertifikasi dengan menggunakan produk-produk grade profesional pilihan.
                        </p>
                        <p className={styles.body}>
                            Kepercayaan ribuan pelanggan setia adalah bukti nyata komitmen kami terhadap hasil kerja yang presisi, pelayanan yang transparan, dan perlindungan jangka panjang untuk investasi berharga Anda.
                        </p>
                    </div>
                </div>

                
                <div className={styles.statsRow}>
                    {stats.map((stat) => (
                        <div key={stat.label} className={styles.statItem}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
