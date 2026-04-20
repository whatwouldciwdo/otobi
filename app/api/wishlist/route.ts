export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ wishlist: [] });
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true },
    });
    const wishlist = wishlistItems.map((wi: any) => wi.productId);
    return NextResponse.json({ wishlist });
  } catch (error: any) {
    console.error("[API /wishlist GET] Error:", error.message);
    return NextResponse.json({ wishlist: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, wishlist } = await req.json();
    if (!userId) return NextResponse.json({ success: false });
    await prisma.wishlistItem.deleteMany({ where: { userId } });
    for (const productId of wishlist) {
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /wishlist POST] Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
