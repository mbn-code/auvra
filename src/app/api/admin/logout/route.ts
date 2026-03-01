import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/admin";

export async function POST(req: NextRequest) {
  // Clear the signed JWT admin session cookie.
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
