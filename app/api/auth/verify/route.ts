export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendWelcomeEmail } from "../../../../lib/emails";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email dan kode verifikasi diperlukan." },
        { status: 400 },
      );
    }

    // Cari token
    const token = await prisma.verificationToken.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Kode verifikasi tidak ditemukan. Silakan daftar ulang." },
        { status: 404 },
      );
    }

    if (new Date() > token.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: token.id } });
      return NextResponse.json(
        { error: "Kode verifikasi sudah kedaluwarsa. Silakan daftar ulang." },
        { status: 410 },
      );
    }

    if (token.code !== code.trim()) {
      return NextResponse.json(
        { error: "Kode verifikasi salah. Coba lagi." },
        { status: 400 },
      );
    }

    // Aktifkan akun
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Hapus token
    await prisma.verificationToken.deleteMany({ where: { email } });

    // Kirim welcome email
    sendWelcomeEmail({ name: user.name ?? user.email, email: user.email }).catch(
      (err) => console.error("[Email] Welcome email failed:", err.message),
    );

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        address: user.address ?? "",
        areaId: user.areaId ?? "",
        areaName: user.areaName ?? "",
        role: user.role ?? "USER",
      },
    });
  } catch (error: any) {
    console.error("[API /auth/verify] Error:", error.message);
    return NextResponse.json(
      { error: "Verifikasi gagal. Coba lagi." },
      { status: 500 },
    );
  }
}
