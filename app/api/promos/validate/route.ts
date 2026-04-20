export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// POST /api/promos/validate
// Body: { code, subtotal, productIds, categories }
export async function POST(req: Request) {
  try {
    const { code, subtotal = 0, productIds = [], categories = [] } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Kode voucher tidak boleh kosong." });
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, message: "Kode voucher tidak ditemukan." });
    }
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, message: "Voucher ini sudah tidak aktif." });
    }
    if (promo.minOrder > 0 && subtotal < promo.minOrder) {
      return NextResponse.json({
        valid: false,
        message: `Minimum belanja Rp ${promo.minOrder.toLocaleString("id-ID")} untuk menggunakan voucher ini.`,
      });
    }

    // Check if promo applies to the cart
    let applies = false;
    const promoType = promo.type ?? "ALL";

    if (promoType === "ALL") {
      applies = true;
    } else if (promoType === "CATEGORY") {
      const promoCats: string[] = promo.categories ? JSON.parse(promo.categories) : [];
      applies = categories.some((c: string) =>
        promoCats.some((pc) => pc.toLowerCase() === c.toLowerCase())
      );
    } else if (promoType === "PRODUCTS") {
      const promoProductIds: string[] = promo.productIds ? JSON.parse(promo.productIds) : [];
      applies = productIds.some((pid: string) => promoProductIds.includes(pid));
    }

    if (!applies) {
      return NextResponse.json({
        valid: false,
        message: "Voucher ini tidak berlaku untuk produk yang ada di keranjang Anda.",
      });
    }

    const discountAmount = Math.floor(subtotal * (promo.discountPct / 100));

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountPct: promo.discountPct,
      promoTitle: promo.title,
      message: `Voucher "${promo.title}" berhasil diterapkan! Diskon ${promo.discountPct}%`,
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: "Terjadi kesalahan server." }, { status: 500 });
  }
}
