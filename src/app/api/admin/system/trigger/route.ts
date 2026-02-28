import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command } = await req.json();
    
    // Instead of spawning locally (which fails on Vercel Serverless),
    // we insert a command into the database for the Raspberry Pi Sentinel to pick up.
    
    // Validate command to ensure it's a known task
    const validCommands = ["pulse", "sync", "sync-force", "prune", "content"];
    if (!validCommands.includes(command)) {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    const { error } = await supabase
      .from('system_commands')
      .insert({ command, status: 'pending' });

    if (error) {
      console.error("[System Trigger Error]:", error);
      return NextResponse.json({ error: "Failed to queue command" }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Task '${command}' queued. The Sentinel will execute it shortly.` 
    });

  } catch (error: any) {
    console.error("[System Trigger Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
