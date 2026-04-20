export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { destinationAreaId, items } = await req.json();
    if (!destinationAreaId || !items?.length) {
      return NextResponse.json(
        { error: "Missing destination or items" },
        { status: 400 },
      );
    }
    const originAreaId =
      process.env.BITESHIP_ORIGIN_AREA_ID ?? "IDNP6IDNC146IDND826IDZ11110";
    const biteshipItems = items.map((item: any) => {
      const rawValue =
        typeof item.value === "number"
          ? item.value
          : parseInt(String(item.value ?? "0").replace(/[^\d]/g, ""), 10) || 0;
      return {
        name: item.name ?? "Produk OTOBI",
        description: item.name ?? "Produk OTOBI",
        value: rawValue > 0 ? rawValue : 10000,
        length: 15,
        width: 10,
        height: 10,
        weight: item.weight ?? 300,
        quantity: item.quantity ?? 1,
      };
    });
    const payload = {
      origin_area_id: originAreaId,
      destination_area_id: destinationAreaId,
      couriers: "jne,jnt,sicepat",
      items: biteshipItems,
    };
    console.log("[Biteship] Sending rates request:", JSON.stringify(payload));
    const res = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("[Biteship] Response:", JSON.stringify(data));
    if (!res.ok || !data.success) {
      console.error("[Biteship] Error:", data);
      return NextResponse.json(
        { error: data.error ?? "Gagal mengambil ongkos kirim", rates: [] },
        { status: 200 },
      );
    }
    const rates: any[] = [];
    for (const courier of data.pricing ?? []) {
      if (!courier.price || courier.price <= 0) continue;
      rates.push({
        courier_name: courier.courier_name,
        courier_code: courier.courier_code,
        courier_service_name: courier.courier_service_name,
        courier_service_code: courier.courier_service_code,
        price: courier.price,
        shipment_duration_range: courier.shipment_duration_range,
        shipment_duration_unit: courier.shipment_duration_unit ?? "days",
      });
    }
    rates.sort((a, b) => a.price - b.price);
    return NextResponse.json({ rates });
  } catch (error: any) {
    console.error("[API /shipping/rates] Error:", error.message);
    return NextResponse.json(
      { error: "Internal error", rates: [] },
      { status: 500 },
    );
  }
}
