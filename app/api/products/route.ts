export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    const ids = idsParam
      ? idsParam
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

    const products = await prisma.product.findMany({
      where: ids.length > 0 ? { id: { in: ids } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("[API /products] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
