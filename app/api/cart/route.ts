export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ cart: [] });
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    const cart = cartItems.map((ci: any) => ({
      id: ci.productId,
      title: ci.product.title,
      image: ci.product.image,
      price: `RP ${Number(ci.product.price).toLocaleString("id-ID")}`,
      quantity: ci.quantity,
    }));
    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error("[API /cart GET] Error:", error.message);
    return NextResponse.json({ cart: [] });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, cart } = await req.json();
    if (!userId) return NextResponse.json({ success: false });
    await prisma.cartItem.deleteMany({ where: { userId } });
    for (const item of cart) {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: item.id,
          quantity: item.quantity,
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /cart POST] Error:", error.message);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
