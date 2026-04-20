export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input") ?? "";
  if (!input || input.length < 3) {
    return NextResponse.json({ areas: [] });
  }
  try {
    const res = await fetch(
      `https://api.biteship.com/v1/maps/areas?countries=ID&input=${encodeURIComponent(input)}&type=single`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BITESHIP_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    if (!res.ok) {
      return NextResponse.json({ areas: [] }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ areas: data.areas ?? [] });
  } catch (error: any) {
    console.error("[API /shipping/areas] Error:", error.message);
    return NextResponse.json({ areas: [] }, { status: 500 });
  }
}
