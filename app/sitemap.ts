import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://otobi.id";

async function getPublishedBlogSlugs(): Promise<string[]> {
    try {
        const blogs = await prisma.blog.findMany({
            where: { isPublished: true },
            select: { slug: true },
        });
        return blogs.map((b) => b.slug);
    } catch {
        return [];
    }
}

async function getProductIds(): Promise<string[]> {
    try {
        const products = await prisma.product.findMany({
            select: { id: true },
        });
        return products.map((p) => p.id);
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/blog`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
    ];

    const [blogSlugs, productIds] = await Promise.all([
        getPublishedBlogSlugs(),
        getProductIds(),
    ]);

    const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
        url: `${BASE_URL}/blog/${slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
    }));

    const productRoutes: MetadataRoute.Sitemap = productIds.map((id) => ({
        url: `${BASE_URL}/products/${id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
    }));

    return [...staticRoutes, ...blogRoutes, ...productRoutes];
}
