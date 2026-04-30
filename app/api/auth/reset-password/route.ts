export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token dan password baru wajib diisi." }, { status: 400 });
    }

    // Cek token di database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Token tidak valid atau sudah digunakan." }, { status: 400 });
    }

    // Cek apakah token sudah expired
    if (new Date() > resetRecord.expiresAt) {
      return NextResponse.json({ error: "Link reset password sudah kadaluarsa. Silakan request ulang." }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Hapus token yang sudah digunakan
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({ success: true, message: "Password berhasil diubah. Silakan login." });
  } catch (error: any) {
    console.error("[API /auth/reset-password] Error:", error.message);
    return NextResponse.json({ error: "Gagal mengatur ulang password. Coba lagi." }, { status: 500 });
  }
}
