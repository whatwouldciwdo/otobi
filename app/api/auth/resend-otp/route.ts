export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendVerificationEmail } from "../../../../lib/emails";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email diperlukan." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { name: true, isVerified: true } });
    if (!user) return NextResponse.json({ error: "Email tidak ditemukan." }, { status: 404 });
    if (user.isVerified) return NextResponse.json({ error: "Akun sudah terverifikasi." }, { status: 400 });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.verificationToken.deleteMany({ where: { email } });
    await prisma.verificationToken.create({ data: { email, code, expiresAt } });
    await sendVerificationEmail({ name: user.name ?? email.split("@")[0], email, code });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /auth/resend-otp] Error:", error.message);
    return NextResponse.json({ error: "Gagal mengirim ulang kode." }, { status: 500 });
  }
}
