export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "../../../../lib/prisma";

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
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 },
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

    
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    
    const user = await prisma.user.create({
      data: {
        id,
        name: name ?? email.split("@")[0],
        email,
        password: hashedPassword,
        phone: phone ?? null,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          address: user.address ?? "",
          areaId: user.areaId ?? "",
          areaName: user.areaName ?? "",
          role: "USER",
        },
      },
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
