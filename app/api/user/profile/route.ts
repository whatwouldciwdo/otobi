export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  try {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });
    if (!u)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? "",
        address: u.address ?? "",
        createdAt: u.createdAt.toISOString(),
      },
    });
  } catch (e: any) {
    console.error("[API /user/profile GET] Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, name, phone, address } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        phone: phone ?? undefined,
        address: address ?? undefined,
      },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[API /user/profile PUT] Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
