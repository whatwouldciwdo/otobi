export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";
import { sendVerificationEmail } from "../../../../lib/emails";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isVerified: true },
    });

    if (existing) {
      if (!existing.isVerified) {
        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.verificationToken.deleteMany({ where: { email } });
        await prisma.verificationToken.create({ data: { email, code, expiresAt } });
        await sendVerificationEmail({ name: name ?? email.split("@")[0], email, code });
        return NextResponse.json({ requiresVerification: true, email }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    await prisma.user.create({
      data: {
        id,
        name: name ?? email.split("@")[0],
        email,
        password: hashedPassword,
        phone: phone ?? null,
        isVerified: false,
      },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await prisma.verificationToken.deleteMany({ where: { email } });
    await prisma.verificationToken.create({ data: { email, code, expiresAt } });

    try {
      await sendVerificationEmail({ name: name ?? email.split("@")[0], email, code });
    } catch (emailErr: any) {
      console.error("[API /auth/register] SMTP error:", emailErr.message);
      await prisma.verificationToken.deleteMany({ where: { email } });
      await prisma.user.delete({ where: { email } }).catch(() => {});
      return NextResponse.json(
        { error: "Gagal mengirim email verifikasi. Pastikan email kamu valid dan coba lagi." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { requiresVerification: true, email },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[API /auth/register] Error:", error.message);
    return NextResponse.json(
      { error: "Registration failed." },
      { status: 500 },
    );
  }
}
