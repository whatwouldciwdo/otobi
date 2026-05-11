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
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promos });
  } catch (error: any) {
    console.error("[Admin/promos GET] Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data promo" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId, title, description, image, discountPct, isActive,
      code, type, categories, productIds, minOrder,
    } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const id = `promo_${Date.now()}`;
    await prisma.promo.create({
      data: {
        id,
        title,
        description: description ?? "",
        image: image ?? null,
        discountPct: parseInt(discountPct ?? "0"),
        isActive: isActive !== false,
        code: code?.trim() || null,
        type: type ?? "ALL",
        categories: categories ? JSON.stringify(categories) : null,
        productIds: productIds ? JSON.stringify(productIds) : null,
        minOrder: parseInt(minOrder ?? "0"),
      },
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("[Admin/promos POST] Error:", error);
    return NextResponse.json({ error: "Gagal membuat promo" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      userId, id, title, description, image, discountPct, isActive,
      code, type, categories, productIds, minOrder,
    } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await prisma.promo.update({
      where: { id },
      data: {
        title,
        description: description ?? "",
        image: image ?? null,
        discountPct: parseInt(discountPct ?? "0"),
        isActive: isActive !== false,
        code: code?.trim() || null,
        type: type ?? "ALL",
        categories: categories ? JSON.stringify(categories) : null,
        productIds: productIds ? JSON.stringify(productIds) : null,
        minOrder: parseInt(minOrder ?? "0"),
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin/promos PUT] Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate promo" }, { status: 500 });
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
    await prisma.promo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Admin/promos DELETE] Error:", error);
    return NextResponse.json({ error: "Gagal menghapus promo" }, { status: 500 });
  }
}
