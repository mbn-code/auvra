import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cookies } from "next/headers";

const ALLOWED_ORIGINS = [
  "https://auvra.eu",
  "https://www.auvra.eu"
];

function isValidOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // Server-to-server calls often lack Origin header
  
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith("http://localhost:")) return true;
  
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!isValidOrigin(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: "Invalid payload, expected array of events" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get('auvra_session_id')?.value || cookieStore.get('auvra_fingerprint')?.value || 'unknown_session';
    const creativeId = cookieStore.get('auvra_creative_id')?.value || null;

    const validEvents = [];
    let rejectedCount = 0;

    for (const event of events) {
      if (!event || typeof event !== 'object') {
        rejectedCount++;
        continue;
      }

      if (!event.event_type) {
        rejectedCount++;
        continue;
      }

      if (event.timestamp) {
        const d = new Date(event.timestamp);
        if (isNaN(d.getTime())) {
          rejectedCount++;
          continue;
        }
      }

      if (event.metadata) {
        try {
          const metadataString = JSON.stringify(event.metadata);
          if (metadataString.length > 4096) {
            rejectedCount++;
            continue;
          }
        } catch {
          rejectedCount++;
          continue;
        }
      }

      validEvents.push({
        ...event,
        session_id: event.session_id || sessionId,
        creative_id: event.creative_id || creativeId,
        timestamp: event.timestamp || new Date().toISOString()
      });
    }

    if (validEvents.length > 0) {
      const { error } = await supabaseAdmin.rpc('batch_insert_pulse_events', {
        events: validEvents
      });

      if (error) {
        console.error("[Ingest API] Supabase RPC Error:", error);
        return NextResponse.json({ error: "Internal error processing events" }, { status: 500 });
      }
    }

    console.log(`[Ingest] Received: ${events.length} | Rejected: ${rejectedCount} | Inserted: ${validEvents.length}`);
    return NextResponse.json({ success: true, count: validEvents.length });
  } catch (error: any) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
