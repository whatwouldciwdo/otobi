export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ orders: [] });
  try {
    const rows = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        biteshipOrderId: true,
        biteshipWaybillId: true,
        biteshipStatus: true,
        courierCompany: true,
        courierServiceName: true,
        shippingCost: true,
        recipientName: true,
        recipientAreaName: true,
        itemsJson: true,
        subtotal: true,
        total: true,
        createdAt: true,
      },
    });
    const orders = rows.map((r: any) => ({
      id: r.id,
      biteshipOrderId: r.biteshipOrderId,
      biteshipWaybillId: r.biteshipWaybillId,
      biteshipStatus: r.biteshipStatus,
      courierCompany: r.courierCompany,
      courierServiceName: r.courierServiceName,
      shippingCost: Number(r.shippingCost),
      recipientName: r.recipientName,
      recipientAreaName: r.recipientAreaName,
      subtotal: Number(r.subtotal),
      total: Number(r.total),
      itemCount: (() => {
        try {
          return JSON.parse(r.itemsJson ?? "[]").length;
        } catch {
          return 0;
        }
      })(),
      createdAt: r.createdAt.toISOString(),
    }));
    return NextResponse.json({ orders });
  } catch (e: any) {
    console.error("[API /user/orders GET] Error:", e.message);
    return NextResponse.json({ orders: [], error: e.message });
  }
}
