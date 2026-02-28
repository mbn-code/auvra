import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdmin } from "@/lib/admin";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { data: item } = await supabaseAdmin
      .from("pulse_inventory")
      .select("images, category")
      .eq("id", id)
      .single();

    if (!item || !item.images || item.images.length === 0) {
      return NextResponse.json({ error: "Item or images not found" }, { status: 404 });
    }

    const imageUrl = item.images[0];
    const scriptPath = path.join(process.cwd(), "scripts", "generate_single_embedding.py");
    
    // Attempt to run the python script
    // NOTE: This requires python3 and dependencies to be installed on the environment.
    // In production (Vercel), this may need an external inference API.
    try {
      const { stdout } = await execPromise(`python3 "${scriptPath}" "${imageUrl}"`);
      const result = JSON.parse(stdout);

      if (result.error) throw new Error(result.error);

      const embedding = result.embedding;

      // Update pulse_inventory
      const { error: updateError } = await supabaseAdmin
        .from("pulse_inventory")
        .update({ style_embedding: embedding })
        .eq("id", id);

      if (updateError) throw updateError;

      // Upsert style_latent_space
      await supabaseAdmin.from("style_latent_space").upsert({
        product_id: id,
        image_url: imageUrl,
        embedding: embedding,
        archetype: item.category || 'general',
        source: "Auvra_Internal_Archive"
      }, { onConflict: 'product_id' });

      return NextResponse.json({ success: true, embedding });
    } catch (err: any) {
      console.error("[DNA Script Error]:", err);
      return NextResponse.json({ error: "Failed to generate DNA. Ensure Python and CLIP are available on this host." }, { status: 503 });
    }

  } catch (error: any) {
    console.error("[DNA API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
