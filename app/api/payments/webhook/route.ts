export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

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

    // Update status pembayaran di DB
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

    // Jika PAID, buat order di Biteship
    if (status === "PAID" && !order.biteshipOrderId) {
      try {
        const INSTANT_COURIERS = ["gojek", "grab", "paxel"];
        const PICKUP_ONLY_COURIERS = ["gojek", "grab", "paxel", "jne"];

        const courier = order.courierCompany?.toLowerCase() ?? "";
        const isInstant = INSTANT_COURIERS.includes(courier);
        const isPickupOnly = PICKUP_ONLY_COURIERS.includes(courier);

        const ORIGIN_LAT = parseFloat(process.env.STORE_LAT ?? "-6.1719");
        const ORIGIN_LNG = parseFloat(process.env.STORE_LNG ?? "106.7357");

        const items = JSON.parse(order.itemsJson ?? "[]");
        const mappedItems = items.map((item: any) => {
          const digits = String(item.price ?? "0").replace(/[^\d]/g, "");
          const value = parseInt(digits, 10) || 10000;
          const normalizedValue = value < 1000 ? value * 1000 : value;
          return {
            name: item.title ?? "Produk OTOBI",
            description: item.title ?? "Produk",
            value: normalizedValue,
            length: item.length ?? 15,
            width: item.width ?? 10,
            height: item.height ?? 10,
            weight: item.weight ?? 300,
            quantity: item.quantity ?? 1,
          };
        });

        const basePayload: any = {
          origin_contact_name: process.env.STORE_NAME ?? "OTOBI Store",
          origin_contact_phone: process.env.STORE_PHONE ?? "08111234567",
          origin_address: process.env.STORE_ADDRESS ?? "Jl. Taman Sari No. 1, Jakarta Barat",
          origin_area_id: process.env.BITESHIP_ORIGIN_AREA_ID ?? "IDNP6IDNC146IDND824IDZ11610",
          destination_contact_name: order.recipientName,
          destination_contact_phone: order.recipientPhone,
          destination_contact_email: order.recipientEmail,
          destination_address: order.recipientAddress,
          destination_area_id: order.recipientAreaId,
          courier_company: order.courierCompany,
          courier_type: order.courierServiceCode,
          delivery_type: "now",
          items: mappedItems,
        };

        if (isInstant) {
          // Kurir instant (Gojek/Grab/Paxel): mode pickup + koordinat GPS
          basePayload.origin_collection_method = "pickup";
          basePayload.origin_coordinate = { latitude: ORIGIN_LAT, longitude: ORIGIN_LNG };
          if ((order as any).destinationLat && (order as any).destinationLng) {
            basePayload.destination_coordinate = {
              latitude: (order as any).destinationLat,
              longitude: (order as any).destinationLng,
            };
          }
        } else {
          // Kurir reguler (JNE, J&T, ID Express)
          if (isPickupOnly) {
            // JNE wajib pickup
            basePayload.origin_collection_method = "pickup";
          } else {
            // J&T dan ID Express: default ke drop_off di Live Mode, tapi pickup di Sandbox agar testing berhasil
            const isTestKey = (process.env.BITESHIP_API_KEY ?? "").startsWith("biteship_test");
            basePayload.origin_collection_method = process.env.BITESHIP_COLLECTION_METHOD ?? (isTestKey ? "pickup" : "drop_off");
          }
        }

        console.log("[Biteship] Creating order after payment confirmed:", external_id, "| instant:", isInstant);
        const biteshipRes = await fetch("https://api.biteship.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(basePayload),
        });

        const biteshipData = await biteshipRes.json();
        console.log("[Biteship] Order created:", biteshipData?.id, "status:", biteshipData?.status);

        if (biteshipData?.id) {
          await prisma.order.update({
            where: { id: external_id },
            data: {
              biteshipOrderId: biteshipData.id,
              biteshipWaybillId: biteshipData.courier_waybill_id ?? null,
              biteshipStatus: biteshipData.status ?? "confirmed",
            },
          });
        } else {
          console.warn("[Biteship] Failed to create order:", biteshipData?.error ?? biteshipData);
        }
      } catch (biteshipErr: any) {
        // Jangan gagalkan webhook karena error Biteship — payment sudah dikonfirmasi
        console.error("[Biteship] Error creating order:", biteshipErr?.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Xendit Webhook] Error:", error?.message);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
