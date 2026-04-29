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
    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const products = rawProducts.map((p) => {
      let categories: string[] = [];
      if (p.category) {
        try {
          const parsed = JSON.parse(p.category);
          categories = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          categories = [p.category];
        }
      }
      return { ...p, categories, category: categories[0] ?? null };
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, description, price, weight, image, categories } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const id = `prod_${Date.now()}`;
    const categoryJson = Array.isArray(categories) && categories.length > 0
      ? JSON.stringify(categories)
      : null;
    await prisma.product.create({
      data: {
        id,
        title,
        description: description ?? "",
        price: parseInt(price),
        weight: parseInt(weight ?? 300),
        image: image ?? "/images/otobi-special-product.png",
        category: categoryJson,
      },
    });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, id, title, description, price, weight, image, categories } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const categoryJson = Array.isArray(categories) && categories.length > 0
      ? JSON.stringify(categories)
      : null;
    await prisma.product.update({
      where: { id },
      data: {
        title,
        description: description ?? "",
        price: parseInt(price),
        weight: parseInt(weight ?? 300),
        image,
        category: categoryJson,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
