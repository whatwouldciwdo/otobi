export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../../../lib/prisma";
import { sendPasswordResetEmail } from "../../../../lib/emails";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    // Selalu return 200 agar tidak bocorkan info akun terdaftar atau tidak
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Hapus token lama, buat token baru (berlaku 1 jam)
    await prisma.passwordResetToken.deleteMany({ where: { email } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });

    await sendPasswordResetEmail({
      name: user.name ?? email.split("@")[0],
      email,
      token,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /auth/forgot-password] Error:", error.message);
    return NextResponse.json({ error: "Gagal mengirim email. Coba lagi." }, { status: 500 });
  }
}
