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
    console.log(
      "[LOGIN DEBUG] email:",
      email,
      "| password length:",
      password?.length,
      "| password:",
      JSON.stringify(password),
      "| user found:",
      !!user,
    );
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(
      "[LOGIN DEBUG] bcrypt compare result:",
      isPasswordValid,
      "| hashed pw starts:",
      user.password?.substring(0, 10),
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    if (!user.isVerified) {
      return NextResponse.json(
        { error: "Akun belum diverifikasi. Cek email kamu untuk kode OTP.", requiresVerification: true, email: user.email },
        { status: 403 },
      );
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
