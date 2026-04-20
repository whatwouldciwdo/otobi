export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const waybill = searchParams.get("waybill");
  const courier = searchParams.get("courier");
  if (!waybill || !courier) {
    return NextResponse.json(
      { error: "waybill and courier are required" },
      { status: 400 },
    );
  }
  try {
    const res = await fetch(
      `https://api.biteship.com/v1/trackings/${encodeURIComponent(waybill)}/couriers/${encodeURIComponent(courier)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );
    const data = await res.json();
    if (!data.success) {
      return NextResponse.json({
        error: data.error ?? "Resi tidak ditemukan atau belum terdaftar",
        tracking: null,
      });
    }
    return NextResponse.json({
      tracking: {
        waybill_id: data.waybill_id,
        courier_code: data.courier_code,
        origin: data.origin,
        destination: data.destination,
        status: data.status,
        history: data.history ?? [],
      },
    });
  } catch (error: any) {
    console.error("[API /tracking] Error:", error.message);
    return NextResponse.json(
      { error: "Gagal melacak paket", tracking: null },
      { status: 500 },
    );
  }
}
