import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  try {
    const links = await prisma.linkItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(links);
  } catch (error: any) {
    console.error("GET Links error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newLink = await prisma.linkItem.create({
      data: {
        title: body.title,
        url: body.url,
        iconType: body.iconType || "default",
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });
    return NextResponse.json(newLink);
  } catch (error: any) {
    console.error("POST Link error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    // Check if bulk reorder
    if (Array.isArray(body)) {
      for (const item of body) {
        await prisma.linkItem.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
      return NextResponse.json({ success: true });
    }

    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updatedLink = await prisma.linkItem.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedLink);
  } catch (error: any) {
    console.error("PUT Link error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.linkItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE Link error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
