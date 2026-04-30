export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { checkAdmin } from "../db";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, targetId, name, role, password } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!targetId) {
      return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
    }
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await prisma.user.update({
      where: { id: targetId },
      data: updateData,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const targetId = searchParams.get("targetId");
  if (!(await checkAdmin(userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  if (!targetId) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }
  if (userId === targetId) {
    return NextResponse.json({ error: "Tidak bisa menghapus akun Anda sendiri." }, { status: 400 });
  }
  try {
    
    await prisma.cartItem.deleteMany({ where: { userId: targetId } });
    await prisma.wishlistItem.deleteMany({ where: { userId: targetId } });
    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, name, email, role, password } = body;
    if (!(await checkAdmin(userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const newUser = await prisma.user.create({
      data: {
        id,
        name: name || email.split("@")[0],
        email,
        password: hashedPassword,
        role: role || "USER",
        isVerified: true, // Akun yang dibuat admin langsung aktif, tidak perlu verifikasi email
      },
    });
    return NextResponse.json({ success: true, user: { id: newUser.id, email: newUser.email } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
