export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// POST /api/tracking/webhook
// Biteship akan POST ke sini ketika status order berubah
export async function POST(req: Request) {
  try {
    // Biteship mengirim body kosong atau JSON saat verifikasi — selalu return 200
    let body: any = {};
    try {
      const text = await req.text();
      if (text) body = JSON.parse(text);
    } catch {
      // Body kosong atau bukan JSON — tetap return 200 untuk verifikasi
    }

    console.log("[Biteship Webhook] Received:", JSON.stringify(body));

    const orderId = body?.order_id;
    const status = body?.status;
    const waybillId = body?.waybill_id;

    // Jika ada order_id, update status tracking di DB
    if (orderId) {
      try {
        await prisma.order.updateMany({
          where: { biteshipOrderId: orderId },
          data: {
            biteshipStatus: status ?? undefined,
            biteshipWaybillId: waybillId ?? undefined,
          },
        });
        console.log(`[Biteship Webhook] Order ${orderId} updated: status=${status}, waybill=${waybillId}`);
      } catch (dbErr: any) {
        console.error("[Biteship Webhook] DB update error:", dbErr?.message);
      }
    }

    // Selalu return 200 OK agar Biteship menganggap webhook valid
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[Biteship Webhook] Error:", error?.message);
    // Tetap return 200 agar Biteship tidak retry terus
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
