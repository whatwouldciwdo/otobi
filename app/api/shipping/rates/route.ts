export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

const INSTANT_COURIERS = ["gojek", "grab", "paxel"];

export async function POST(req: Request) {
  try {
    const { destinationAreaId, destinationLatitude, destinationLongitude, items } = await req.json();
    if (!destinationAreaId || !items?.length) {
      return NextResponse.json(
        { error: "Missing destination or items" },
        { status: 400 },
      );
    }

    const originAreaId =
      process.env.BITESHIP_ORIGIN_AREA_ID ?? "IDNP6IDNC146IDND824IDZ11610";
    // Koordinat toko OTOBI di Kembangan Utara, Jakarta Barat
    const ORIGIN_LAT = parseFloat(process.env.STORE_LAT ?? "-6.1719");
    const ORIGIN_LNG = parseFloat(process.env.STORE_LNG ?? "106.7357");

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

    const biteshipHeaders = {
      Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
      "Content-Type": "application/json",
    };

    // ─── 1. Cek ongkir kurir REGULER (JNE, J&T, ID Express, SiCepat) ───
    const regularPayload = {
      origin_area_id: originAreaId,
      destination_area_id: destinationAreaId,
      couriers: "jne,jnt,idexpress,sicepat",
      items: biteshipItems,
    };
    console.log("[Biteship] Sending regular rates request:", JSON.stringify(regularPayload));
    const regularRes = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: biteshipHeaders,
      body: JSON.stringify(regularPayload),
    });
    const regularData = await regularRes.json();
    console.log("[Biteship] Regular rates:", regularData?.success, regularData?.error ?? "");

    // ─── 2. Cek ongkir kurir INSTANT (Gojek, Grab, Paxel) — jika ada koordinat GPS ───
    let instantData: any = null;
    const hasCoords =
      destinationLatitude !== undefined &&
      destinationLatitude !== null &&
      destinationLongitude !== undefined &&
      destinationLongitude !== null;

    if (hasCoords) {
      const instantPayload = {
        origin_area_id: originAreaId,
        destination_area_id: destinationAreaId,
        origin_coordinate: { latitude: ORIGIN_LAT, longitude: ORIGIN_LNG },
        destination_coordinate: {
          latitude: Number(destinationLatitude),
          longitude: Number(destinationLongitude),
        },
        couriers: "gojek,grab,paxel",
        items: biteshipItems,
      };
      console.log("[Biteship] Sending instant rates request");
      try {
        const instantRes = await fetch("https://api.biteship.com/v1/rates/couriers", {
          method: "POST",
          headers: biteshipHeaders,
          body: JSON.stringify(instantPayload),
        });
        instantData = await instantRes.json();
        console.log("[Biteship] Instant rates:", instantData?.success, instantData?.error ?? "");
      } catch (e: any) {
        console.warn("[Biteship] Instant rates failed:", e.message);
      }
    }

    // ─── 3. Gabungkan hasil reguler + instant ───
    const rates: any[] = [];

    for (const courier of regularData?.pricing ?? []) {
      if (!courier.price || courier.price <= 0) continue;
      rates.push({
        courier_name: courier.courier_name,
        courier_code: courier.courier_code,
        courier_service_name: courier.courier_service_name,
        courier_service_code: courier.courier_service_code,
        price: courier.price,
        shipment_duration_range: courier.shipment_duration_range,
        shipment_duration_unit: courier.shipment_duration_unit ?? "days",
        is_instant: false,
      });
    }

    for (const courier of instantData?.pricing ?? []) {
      if (!courier.price || courier.price <= 0) continue;
      if (!INSTANT_COURIERS.includes(courier.courier_code)) continue;
      rates.push({
        courier_name: courier.courier_name,
        courier_code: courier.courier_code,
        courier_service_name: courier.courier_service_name,
        courier_service_code: courier.courier_service_code,
        price: courier.price,
        shipment_duration_range: courier.shipment_duration_range,
        shipment_duration_unit: courier.shipment_duration_unit ?? "hours",
        is_instant: true,
      });
    }

    rates.sort((a, b) => a.price - b.price);

    if (rates.length === 0) {
      const errorMsg =
        regularData?.error ?? instantData?.error ?? "Ongkos kirim tidak tersedia untuk wilayah ini.";
      return NextResponse.json({ error: errorMsg, rates: [] });
    }

    return NextResponse.json({ rates });
  } catch (error: any) {
    console.error("[API /shipping/rates] Error:", error.message);
    return NextResponse.json(
      { error: "Internal error", rates: [] },
      { status: 500 },
    );
  }
}

