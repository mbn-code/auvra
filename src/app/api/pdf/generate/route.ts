import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { outfit_id } = await req.json();

  if (!outfit_id) {
    return NextResponse.json({ error: "Missing outfit_id" }, { status: 400 });
  }

  try {
    const { data: outfit, error: outfitError } = await supabase
      .from("user_outfits")
      .select("id")
      .eq("id", outfit_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (outfitError) {
      throw outfitError;
    }

    if (!outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    const workerUrl = process.env.PDF_WORKER_URL || 'http://localhost:4000/generate-pdf';
    const workerSecret = process.env.WORKER_SECRET || '';
    
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${workerSecret}`
      },
      body: JSON.stringify({ outfit_id, user_id: user.id }),
    });

    if (!response.ok) {
      throw new Error('PDF Worker failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("PDF Generate Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "PDF generation failed" }, { status: 500 });
  }
}
