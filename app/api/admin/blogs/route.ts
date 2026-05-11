export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { checkAdmin } from "../db";
import prisma from "../../../../lib/prisma";
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ blogs });
  } catch (error: any) {
    console.error("[Admin/blogs GET] Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data blog" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      title,
      slug,
      excerpt,
      content,
      image,
      author,
      isPublished,
      metaTitle,
      metaDescription,
      keywords,
    } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const id = `blog_${Date.now()}`;
    await prisma.blog.create({
      data: {
        id,
        title,
        slug,
        excerpt: excerpt ?? "",
        content,
        image: image ?? null,
        author: author ?? "Admin",
        isPublished: isPublished !== false,
      },
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("[Admin/blogs POST] Error:", error);
    return NextResponse.json({ error: "Gagal membuat blog" }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      id,
      title,
      slug,
      excerpt,
      content,
      image,
      author,
      isPublished,
      metaTitle,
      metaDescription,
      keywords,
    } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await prisma.blog.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt ?? "",
        content,
        image: image ?? null,
        author: author ?? "Admin",
        isPublished: isPublished !== false,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin/blogs PUT] Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate blog" }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const id = searchParams.get("id");
  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
  try {
    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin/blogs DELETE] Error:", error);
    return NextResponse.json({ error: "Gagal menghapus blog" }, { status: 500 });
  }
}
