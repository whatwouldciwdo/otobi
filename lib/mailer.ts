import nodemailer from "nodemailer";

// Menggunakan IP langsung untuk menghindari DNS resolution error (getaddrinfo EBUSY)
// di Netlify/AWS environment. IP dari server Rumahweb: mail.arxenovasocial.com
const SMTP_HOST = process.env.SMTP_HOST ?? "202.10.43.170";
const SMTP_PORT = 465;
const SMTP_PASS = process.env.SMTP_PASSWORD!;

const transportOptions = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  tls: {
    // Diperlukan karena sertifikat SSL server dikonfigurasi untuk hostname,
    // bukan IP langsung. Koneksi tetap terenkripsi, hanya verifikasi hostname dinonaktifkan.
    rejectUnauthorized: false,
  },
};

export const orderMailer = nodemailer.createTransport({
  ...transportOptions,
  auth: {
    user: process.env.SMTP_ORDER_USER!,
    pass: SMTP_PASS,
  },
});

export const noReplyMailer = nodemailer.createTransport({
  ...transportOptions,
  auth: {
    user: process.env.SMTP_NOREPLY_USER!,
    pass: SMTP_PASS,
  },
});
