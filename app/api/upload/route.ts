export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key if available, otherwise use publishable key
// NOTE: For writing to Storage, you should add SUPABASE_SERVICE_ROLE_KEY to your Netlify env vars
// and update line below. Using publishable key requires the bucket to allow public uploads.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const BUCKET_NAME = "uploads";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, WEBP, GIF are allowed." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    // Convert File to ArrayBuffer then to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[API /upload] Supabase Storage error:", uploadError.message);
      return NextResponse.json(
        { error: "Upload failed: " + uploadError.message },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueName);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error("[API /upload] Error:", error.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
