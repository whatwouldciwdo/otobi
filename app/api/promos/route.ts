export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

// Public endpoint — returns all active promos (no sensitive data)
export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        discountPct: true,
        code: true,
        type: true,
        categories: true,
        productIds: true,
        minOrder: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ promos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
