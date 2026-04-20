export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const search = searchParams.get("search");
    const blogs = await prisma.blog.findMany({
      where: {
        isPublished: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { excerpt: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        author: true,
        createdAt: true,
        isPublished: true,
      },
    });
    return NextResponse.json({ blogs });
  } catch (error: any) {
    console.error("[API /api/blogs] GET error:", error.message);
    return NextResponse.json(
      { error: "Gagal mengambil data blog" },
      { status: 500 },
    );
  }
}
