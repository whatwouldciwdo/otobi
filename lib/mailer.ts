import nodemailer from "nodemailer";

const SMTP_HOST = "mail.arxenovasocial.com";
const SMTP_PORT = 465;
const SMTP_PASS = process.env.SMTP_PASSWORD!;

export const orderMailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_ORDER_USER!,
    pass: SMTP_PASS,
  },
});

export const noReplyMailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_NOREPLY_USER!,
    pass: SMTP_PASS,
  },
});
