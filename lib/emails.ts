import { orderMailer, noReplyMailer } from "./mailer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://otobi.id";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export async function sendVerificationEmail(user: {
  name: string;
  email: string;
  code: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <tr>
          <td style="background:#101312;padding:28px 40px;">
            <img src="${BASE_URL}/images/otobi-logo-white.png" alt="OTOBI" height="34" style="display:block;" />
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 20px;">
            <h1 style="margin:0 0 10px;font-size:20px;color:#101312;font-weight:600;">Verifikasi Akunmu 🔐</h1>
            <p style="margin:0 0 28px;color:#5c626e;font-size:14px;line-height:1.7;">Halo <strong>${user.name}</strong>, gunakan kode berikut untuk mengaktifkan akunmu. Kode berlaku selama <strong>15 menit</strong>.</p>
            <div style="background:#f7f9fc;border-radius:16px;padding:28px;text-align:center;">
              <div style="letter-spacing:0.3em;font-size:38px;font-weight:700;color:#cc0000;font-family:monospace;">${user.code}</div>
            </div>
            <p style="margin:20px 0 0;color:#a0a5ad;font-size:12px;">Jika kamu tidak mendaftar di OTOBI, abaikan email ini.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f7f9fc;padding:18px 40px;text-align:center;">
            <p style="margin:0;color:#a0a5ad;font-size:12px;">© ${new Date().getFullYear()} OTOBI Detailing Studio</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await noReplyMailer.sendMail({
    from: `"OTOBI" <${process.env.SMTP_NOREPLY_USER}>`,
    to: user.email,
    subject: `${user.code} — Kode Verifikasi Akun OTOBI`,
    html,
  });
}

export async function sendOrderReceiptEmail(order: {
  id: string;
  recipientName: string;
  recipientEmail: string;
  recipientAddress: string;
  recipientAreaName: string;
  courierCompany: string;
  courierServiceName: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  itemsJson: string;
  createdAt: string | Date;
}) {
  const items: Array<{ title: string; price: number; quantity: number; image?: string }> =
    JSON.parse(order.itemsJson);

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" width="52" height="52" style="border-radius:8px;object-fit:cover;vertical-align:middle;margin-right:10px;" />` : ""}
          <span style="font-weight:500;color:#101312;">${item.title}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:center;color:#5c626e;">x${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;color:#101312;">${fmt(item.price * item.quantity)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:#101312;padding:32px 40px;">
            <img src="${BASE_URL}/images/otobi-logo-white.png" alt="OTOBI" height="36" style="display:block;" />
          </td>
        </tr>
        <!-- Hero -->
        <tr>
          <td style="padding:32px 40px 0;">
            <h1 style="margin:0 0 8px;font-size:22px;color:#101312;font-weight:600;">Pesanan Dikonfirmasi! 🎉</h1>
            <p style="margin:0;color:#5c626e;font-size:14px;">Halo <strong>${order.recipientName}</strong>, pesananmu sudah kami terima dan sedang diproses.</p>
          </td>
        </tr>
        <!-- Order ID -->
        <tr>
          <td style="padding:20px 40px;">
            <div style="background:#f7f9fc;border-radius:14px;padding:16px 20px;display:inline-block;">
              <span style="font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">Nomor Pesanan</span>
              <div style="font-size:16px;font-weight:700;color:#101312;margin-top:4px;">${order.id}</div>
            </div>
          </td>
        </tr>
        <!-- Items -->
        <tr>
          <td style="padding:0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <thead>
                <tr>
                  <th style="text-align:left;font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Produk</th>
                  <th style="text-align:center;font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Qty</th>
                  <th style="text-align:right;font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding-bottom:10px;">Harga</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td>
        </tr>
        <!-- Totals -->
        <tr>
          <td style="padding:16px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#5c626e;font-size:14px;padding:4px 0;">Subtotal</td>
                <td style="text-align:right;color:#101312;font-size:14px;padding:4px 0;">${fmt(order.subtotal)}</td>
              </tr>
              <tr>
                <td style="color:#5c626e;font-size:14px;padding:4px 0;">Ongkos kirim (${order.courierCompany} ${order.courierServiceName})</td>
                <td style="text-align:right;color:#101312;font-size:14px;padding:4px 0;">${fmt(order.shippingCost)}</td>
              </tr>
              <tr>
                <td style="color:#101312;font-size:15px;font-weight:700;padding:12px 0 4px;border-top:2px solid #f0f0f0;">Total</td>
                <td style="text-align:right;color:#cc0000;font-size:15px;font-weight:700;padding:12px 0 4px;border-top:2px solid #f0f0f0;">${fmt(order.total)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Shipping info -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#f7f9fc;border-radius:14px;padding:16px 20px;">
              <div style="font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Alamat Pengiriman</div>
              <div style="font-weight:500;color:#101312;font-size:14px;">${order.recipientName}</div>
              <div style="color:#5c626e;font-size:14px;margin-top:4px;">${order.recipientAddress}, ${order.recipientAreaName}</div>
            </div>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="${BASE_URL}/orders/${order.id}" style="display:inline-block;background:#cc0000;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;">Pantau Status Pesanan</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f7f9fc;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#a0a5ad;font-size:12px;">Email ini dikirim otomatis oleh sistem OTOBI. Jangan balas email ini.</p>
            <p style="margin:6px 0 0;color:#a0a5ad;font-size:12px;">© ${new Date().getFullYear()} OTOBI Detailing Studio</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await orderMailer.sendMail({
    from: `"OTOBI Order" <${process.env.SMTP_ORDER_USER}>`,
    to: order.recipientEmail,
    subject: `✅ Pesanan ${order.id} Dikonfirmasi — OTOBI`,
    html,
  });
}

export async function sendWelcomeEmail(user: {
  name: string;
  email: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        <!-- Header -->
        <tr>
          <td style="background:#101312;padding:32px 40px;">
            <img src="${BASE_URL}/images/otobi-logo-white.png" alt="OTOBI" height="36" style="display:block;" />
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:22px;color:#101312;font-weight:600;">Selamat datang di OTOBI! 👋</h1>
            <p style="margin:0 0 20px;color:#5c626e;font-size:14px;line-height:1.7;">
              Halo <strong>${user.name}</strong>, akun kamu di OTOBI Detailing Studio sudah berhasil dibuat.
              Kamu sekarang bisa berbelanja produk perawatan kendaraan terbaik langsung dari website kami.
            </p>
            <a href="${BASE_URL}/shop" style="display:inline-block;background:#cc0000;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:14px;">Mulai Belanja</a>
          </td>
        </tr>
        <!-- Divider info -->
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:#f7f9fc;border-radius:14px;padding:16px 20px;">
              <div style="font-size:12px;color:#a0a5ad;font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px;">Detail Akun</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13px;color:#5c626e;padding:3px 0;">Nama</td>
                  <td style="font-size:13px;font-weight:500;color:#101312;text-align:right;">${user.name}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#5c626e;padding:3px 0;">Email</td>
                  <td style="font-size:13px;font-weight:500;color:#101312;text-align:right;">${user.email}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f7f9fc;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#a0a5ad;font-size:12px;">Email ini dikirim otomatis. Jika kamu tidak mendaftar, abaikan email ini.</p>
            <p style="margin:6px 0 0;color:#a0a5ad;font-size:12px;">© ${new Date().getFullYear()} OTOBI Detailing Studio</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await noReplyMailer.sendMail({
    from: `"OTOBI" <${process.env.SMTP_NOREPLY_USER}>`,
    to: user.email,
    subject: `Selamat datang di OTOBI, ${user.name}! 🎉`,
    html,
  });
}
