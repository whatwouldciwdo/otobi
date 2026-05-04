export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    // Handle unverified accounts:
    // - If account is less than 24 hours old → redirect to OTP (fresh signup not yet verified)
    // - If account is older → auto-verify (legacy account created before OTP feature) and allow login
    if (!user.isVerified) {
      const accountAgeMs = Date.now() - new Date(user.createdAt).getTime();
      const isRecentSignup = accountAgeMs < 24 * 60 * 60 * 1000; // < 24 hours

      if (isRecentSignup) {
        // New signup that hasn't verified yet → redirect to OTP
        return NextResponse.json(
          {
            error: "Akun belum diverifikasi. Cek email kamu untuk kode OTP.",
            requiresVerification: true,
            email: user.email,
          },
          { status: 403 },
        );
      }

      // Legacy account (older than 24h) → auto-verify and allow login
      await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role ?? "USER",
        address: user.address ?? "",
        areaId: user.areaId ?? "",
        areaName: user.areaName ?? "",
      },
    });
  } catch (error: any) {
    console.error("[API /auth/login] Error:", error.message);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
