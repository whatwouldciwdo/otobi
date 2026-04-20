require("dotenv").config();
const mariadb = require("mariadb");

const pool = mariadb.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "otobi_db",
    connectionLimit: 3,
});

const products = [
    {
        id: "all-purpose-cleaner",
        title: "All Purpose Cleaner",
        image: "/product/images/all-purpose-cleaner-otobi.png",
        price: 123000,
        rating: 5,
        category: "Detailing",
        description:
            "A premium, versatile cleaner designed to tackle dirt, grease, and grime on various surfaces of your vehicle. Formulated for safety and effectiveness, leaving your car spotless without damaging delicate materials.",
    },
    {
        id: "ipa-paint-decreaser",
        title: "Ipa Paint Decreaser",
        image: "/product/images/ipa-paint-otobi.png",
        price: 123000,
        rating: 5,
        category: "Detailing",
        description:
            "Essential prep spray for any detailing process. Our IPA Paint Decreaser effectively strips away old waxes, polishing oils, and residues to ensure a perfectly clean surface before applying ceramic coatings or sealants.",
    },
    {
        id: "ph-balanced-shampoo",
        title: "PH Balanced Shampoo",
        image: "/product/images/ph-balanced-shampoo-otobi.png",
        price: 123000,
        rating: 5,
        category: "Detailing",
        description:
            "A gentle yet powerful pH balanced auto wash. Creates thick, luxurious suds that safely lift away dirt and road grime without stripping your existing wax or ceramic coating layer. Leaves a brilliant shine.",
    },
];

async function main() {
    console.log("🌱 Seeding database...");
    let conn;

    try {
        conn = await pool.getConnection();

        for (const p of products) {
            await conn.query(
                `INSERT INTO Product (id, title, image, price, rating, category, description, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    image = VALUES(image),
                    price = VALUES(price),
                    rating = VALUES(rating),
                    category = VALUES(category),
                    description = VALUES(description),
                    updatedAt = NOW()`,
                [p.id, p.title, p.image, p.price, p.rating, p.category, p.description]
            );
            console.log(`✅ Upserted: ${p.title}`);
        }

        console.log("🎉 Seeding complete!");
    } finally {
        if (conn) conn.release();
        await pool.end();
    }
}

main().catch((e) => {
    console.error("❌ Seed error:", e.message);
    process.exit(1);
});
