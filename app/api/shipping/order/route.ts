export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendOrderReceiptEmail } from "../../../../lib/emails";

export async function POST(req: Request) {
  try {
    const {
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientAddress,
      destinationAreaId,
      destinationAreaName,
      destinationPostalCode,
      courierCompany,
      courierServiceCode,
      courierServiceName,
      shippingCost,
      items,
      subtotal,
      total,
      userId,
    } = await req.json();

    // Buat order di DB dulu — Biteship order akan dibuat setelah pembayaran dikonfirmasi
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await prisma.order.create({
      data: {
        id: orderId,
        biteshipOrderId: null,
        biteshipWaybillId: null,
        biteshipStatus: "waiting_payment",
        courierCompany,
        courierServiceName,
        courierServiceCode,
        shippingCost,
        recipientName,
        recipientPhone,
        recipientEmail,
        recipientAddress,
        recipientAreaId: destinationAreaId,
        recipientAreaName: destinationAreaName,
        recipientPostalCode: destinationPostalCode ?? null,
        itemsJson: JSON.stringify(items),
        subtotal,
        total,
        userId: userId ?? null,
      },
    });

    if (userId) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: {
            phone: recipientPhone,
            address: recipientAddress,
            areaId: destinationAreaId,
            areaName: destinationAreaName,
          },
        });
      } catch (err: any) {
        console.warn(
          "[API /shipping/order] Failed to auto-save user details:",
          err.message,
        );
      }
    }

    sendOrderReceiptEmail({
      id: orderId,
      recipientName,
      recipientEmail,
      recipientAddress,
      recipientAreaName: destinationAreaName,
      courierCompany,
      courierServiceName,
      shippingCost,
      subtotal,
      total,
      itemsJson: JSON.stringify(items),
      createdAt: new Date(),
    }).catch((err) => console.error("[Email] Order receipt failed:", err.message));

    return NextResponse.json({
      orderId,
      status: "waiting_payment",
      message: "Order berhasil dibuat! Silakan lanjutkan pembayaran.",
    });
  } catch (error: any) {
    console.error("[API /shipping/order] Error:", error.message);
    return NextResponse.json(
      { error: "Gagal membuat order: " + error.message },
      { status: 500 },
    );
  }
}
