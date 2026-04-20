export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET /api/orders/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const orderData = await prisma.order.findUnique({
      where: { id },
    });

    if (!orderData) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = {
      ...orderData,
      shippingCost: Number(orderData.shippingCost),
      subtotal: Number(orderData.subtotal),
      total: Number(orderData.total),
      createdAt: orderData.createdAt.toISOString(),
      updatedAt: orderData.updatedAt.toISOString(),
    };
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("[API /orders/:id] Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
