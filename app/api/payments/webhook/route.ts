export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import crypto from "crypto";

// POST /api/payments/webhook
// Xendit akan POST ke sini ketika status invoice berubah
export async function POST(req: Request) {
  try {
    // Verifikasi webhook token dari Xendit
    const webhookToken = req.headers.get("x-callback-token");
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

    if (expectedToken && webhookToken !== expectedToken) {
      console.warn("[Xendit Webhook] Invalid token:", webhookToken);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[Xendit Webhook] Received:", JSON.stringify(body, null, 2));

    const {
      external_id,   // ini adalah orderId kita
      id: xenditId,  // Xendit invoice ID
      status,        // PAID, EXPIRED, etc.
      payment_method,
      paid_at,
      payment_channel,
    } = body;

    if (!external_id) {
      return NextResponse.json({ error: "external_id missing" }, { status: 400 });
    }

    // Cari order berdasarkan ID
    const order = await prisma.order.findUnique({
      where: { id: external_id },
    });

    if (!order) {
      console.warn("[Xendit Webhook] Order not found:", external_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Xendit status ke status internal
    const paymentStatus = status === "PAID"
      ? "PAID"
      : status === "EXPIRED"
      ? "EXPIRED"
      : status === "FAILED"
      ? "FAILED"
      : "PENDING";

    await prisma.order.update({
      where: { id: external_id },
      data: {
        paymentStatus,
        paymentMethod: payment_channel ?? payment_method ?? null,
        paidAt: status === "PAID" && paid_at ? new Date(paid_at) : undefined,
        xenditInvoiceId: xenditId ?? order.xenditInvoiceId,
      },
    });

    console.log(`[Xendit Webhook] Order ${external_id} updated to ${paymentStatus}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Xendit Webhook] Error:", error?.message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
