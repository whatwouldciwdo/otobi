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

    const biteshipPayload = {
      origin_contact_name: process.env.STORE_NAME ?? "OTOBI Store",
      origin_contact_phone: process.env.STORE_PHONE ?? "08111234567",
      origin_address:
        process.env.STORE_ADDRESS ?? "Jl. Taman Sari No. 1, Jakarta Barat",
      origin_area_id:
        process.env.BITESHIP_ORIGIN_AREA_ID ?? "IDNP6IDNC146IDND826IDZ11110",
      destination_contact_name: recipientName,
      destination_contact_phone: recipientPhone,
      destination_contact_email: recipientEmail,
      destination_address: recipientAddress,
      destination_area_id: destinationAreaId,
      courier_company: courierCompany,
      courier_type: courierServiceCode,
      delivery_type: "now",
      items: items.map((item: any) => {
        const digits = String(item.price ?? "0").replace(/[^\d]/g, "");
        const value = parseInt(digits, 10) || 10000;
        const normalizedValue = value < 1000 ? value * 1000 : value;
        return {
          name: item.title ?? "Produk OTOBI",
          description: item.title ?? "Produk",
          value: normalizedValue,
          length: 15,
          width: 10,
          height: 10,
          weight: item.weight ?? 300,
          quantity: item.quantity ?? 1,
        };
      }),
    };

    console.log("[Biteship] Creating order:", JSON.stringify(biteshipPayload));

    const biteshipRes = await fetch("https://api.biteship.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(biteshipPayload),
    });

    const biteshipData = await biteshipRes.json();
    console.log("[Biteship] Order response:", JSON.stringify(biteshipData));

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const biteshipOrderId = biteshipData?.id ?? null;
    const biteshipWaybillId = biteshipData?.courier_waybill_id ?? null;
    const biteshipStatus = biteshipData?.status ?? "pending";

    await prisma.order.create({
      data: {
        id: orderId,
        biteshipOrderId,
        biteshipWaybillId,
        biteshipStatus,
        courierCompany,
        courierServiceName,
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

    // Kirim receipt email (fire-and-forget)
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

    if (!biteshipData?.success && !biteshipData?.id) {
      return NextResponse.json({
        orderId,
        biteshipError: biteshipData?.error ?? "Biteship order creation failed",
        waybillId: null,
        status: "pending",
        message:
          "Order tersimpan, namun pembuatan resi Biteship gagal. Kami akan memproses manual.",
      });
    }

    return NextResponse.json({
      orderId,
      biteshipOrderId: biteshipOrderId,
      waybillId: biteshipWaybillId,
      status: biteshipStatus,
      courierTrackingUrl: biteshipData?.courier_tracking_id
        ? `https://biteship.com/track/${biteshipData.courier_tracking_id}`
        : null,
      message: "Order berhasil dibuat!",
    });
  } catch (error: any) {
    console.error("[API /shipping/order] Error:", error.message);
    return NextResponse.json(
      { error: "Gagal membuat order: " + error.message },
      { status: 500 },
    );
  }
}
