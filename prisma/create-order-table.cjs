const mariadb = require("mariadb");
const pool = mariadb.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "otobi_db",
});

async function main() {
    const conn = await pool.getConnection();
    try {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS \`Order\` (
                id VARCHAR(191) NOT NULL,
                biteshipOrderId VARCHAR(191) NULL,
                biteshipWaybillId VARCHAR(191) NULL,
                biteshipStatus VARCHAR(100) NULL DEFAULT 'confirmed',
                courierCompany VARCHAR(100) NOT NULL,
                courierServiceName VARCHAR(200) NOT NULL,
                shippingCost INT NOT NULL,
                recipientName VARCHAR(200) NOT NULL,
                recipientPhone VARCHAR(50) NOT NULL,
                recipientEmail VARCHAR(200) NOT NULL,
                recipientAddress TEXT NOT NULL,
                recipientAreaId VARCHAR(200) NOT NULL,
                recipientAreaName VARCHAR(300) NOT NULL,
                recipientPostalCode VARCHAR(20) NULL,
                itemsJson LONGTEXT NOT NULL,
                subtotal INT NOT NULL,
                total INT NOT NULL,
                userId VARCHAR(191) NULL,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                PRIMARY KEY (id),
                UNIQUE KEY biteshipOrderId (biteshipOrderId)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
        `);
        console.log("✅ Order table created successfully!");
    } finally {
        conn.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
});
