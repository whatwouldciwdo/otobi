export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import Xendit from "xendit-node";

const xendit = new Xendit({ secretKey: process.env.XENDIT_SECRET_KEY! });

// POST /api/payments/create
// Body: { orderId }
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId diperlukan" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    // Kalau sudah punya payment URL dan masih PENDING, return yang existing
    if (order.paymentUrl && order.paymentStatus === "PENDING") {
      return NextResponse.json({ paymentUrl: order.paymentUrl });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://otobi.id";
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // Expire 24 jam

    // @ts-ignore — xendit-node Invoice API
    const invoice = await xendit.Invoice.createInvoice({
      data: {
        externalId: orderId,
        amount: order.total,
        payerEmail: order.recipientEmail,
        description: `Pembayaran Order OTOBI #${orderId}`,
        currency: "IDR",
        invoiceDuration: 86400, // 24 jam dalam detik
        successRedirectUrl: `${baseUrl}/order/${orderId}?payment=success`,
        failureRedirectUrl: `${baseUrl}/order/${orderId}?payment=failed`,
        paymentMethods: [
          "BNI",
          "BRI",
          "MANDIRI",
          "PERMATA",
          "BCA",
          "SAHABAT_SAMPOERNA",
          "BJB",
          "BSI",
          "OVO",
          "DANA",
          "LINKAJA",
          "SHOPEEPAY",
          "ASTRAPAY",
          "JENIUSPAY",
          "CREDIT_CARD",
          "QRIS",
          "ALFAMART",
          "INDOMARET",
        ],
        customer: {
          givenNames: order.recipientName,
          email: order.recipientEmail,
          mobileNumber: order.recipientPhone,
        },
        customerNotificationPreference: {
          invoiceCreated: ["email", "whatsapp"],
          invoiceReminder: ["email", "whatsapp"],
          invoicePaid: ["email", "whatsapp"],
          // @ts-ignore
          invoiceExpired: ["email"],
        },
        fees: [],
        items: (() => {
          try {
            const items = JSON.parse(order.itemsJson ?? "[]");
            return items.map((item: any) => ({
              name: item.title ?? "Produk OTOBI",
              quantity: item.quantity ?? 1,
              price: (() => {
                const digits = String(item.price ?? "0").replace(/[^\d]/g, "");
                const val = parseInt(digits, 10) || 10000;
                return val < 1000 ? val * 1000 : val;
              })(),
              category: "Physical",
            }));
          } catch {
            return [];
          }
        })(),
      },
    });

    const paymentUrl = invoice.invoiceUrl;
    const xenditInvoiceId = invoice.id;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        xenditInvoiceId,
        paymentUrl,
        paymentStatus: "PENDING",
      },
    });

    return NextResponse.json({ paymentUrl, xenditInvoiceId });
  } catch (error: any) {
    console.error("[Xendit] Create invoice error:", error?.message ?? error);
    return NextResponse.json(
      { error: "Gagal membuat invoice pembayaran: " + (error?.message ?? "Unknown error") },
      { status: 500 }
    );
  }
}
