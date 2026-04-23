import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/products/", "/blog/", "/about", "/contact"],
                disallow: [
                    "/admin/",
                    "/api/",
                    "/auth/",
                    "/account/",
                    "/checkout/",
                    "/cart/",
                    "/order/",
                    "/tracking/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: ["/"],
                disallow: [
                    "/admin/",
                    "/api/",
                    "/auth/",
                    "/account/",
                    "/checkout/",
                    "/cart/",
                    "/order/",
                    "/tracking/",
                ],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
