import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin";
import { spawn } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command } = await req.json();
    
    let shellCommand = "";

    switch (command) {
      case "pulse":
        shellCommand = "npx tsx scripts/pulse-run.ts";
        break;
      case "sync":
        shellCommand = "python3 scripts/neural_sync.py";
        break;
      case "sync-force":
        shellCommand = "python3 scripts/neural_sync.py --force";
        break;
      case "prune":
        shellCommand = "python3 scripts/prune_archive.py";
        break;
      case "content":
        shellCommand = "npx tsx scripts/generate-daily-content.ts";
        break;
      default:
        return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    // Execute the command in the background
    console.log(`[System Trigger] Executing: ${shellCommand}`);
    
    // Use a different name to avoid conflict with global 'process'
    const child = spawn(shellCommand, {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();

    return NextResponse.json({ 
      success: true, 
      message: `Task '${command}' initiated in background. Check server logs or sentinel.log for details.` 
    });

  } catch (error: any) {
    console.error("[System Trigger Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
