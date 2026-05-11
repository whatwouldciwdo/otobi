import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { checkAdmin } from "../db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const links = await prisma.linkItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(links);
  } catch (error: any) {
    console.error("GET Links error:", error);
    return NextResponse.json({ error: "Gagal mengambil data link" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ...linkData } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const newLink = await prisma.linkItem.create({
      data: {
        title: linkData.title,
        url: linkData.url,
        iconType: linkData.iconType || "default",
        order: linkData.order || 0,
        isActive: linkData.isActive !== undefined ? linkData.isActive : true,
      },
    });
    return NextResponse.json(newLink);
  } catch (error: any) {
    console.error("POST Link error:", error);
    return NextResponse.json({ error: "Gagal membuat link" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    // Check if bulk reorder
    if (Array.isArray(body)) {
      const userId = body[0]?.userId;
      if (!(await checkAdmin(userId))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      for (const item of body) {
        await prisma.linkItem.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
      return NextResponse.json({ success: true });
    }

    const { id, userId, ...data } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updatedLink = await prisma.linkItem.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedLink);
  } catch (error: any) {
    console.error("PUT Link error:", error);
    return NextResponse.json({ error: "Gagal mengupdate link" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.linkItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Link error:", error);
    return NextResponse.json({ error: "Gagal menghapus link" }, { status: 500 });
  }
}
