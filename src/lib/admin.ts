import { cookies } from "next/headers";
import { createClient } from "./supabase-server";

const ALLOWED_UIDS = ["52f1626b-c411-48af-aa9d-ee9a6beaabc6"];

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const isAdminSession = cookieStore.get("admin_session")?.value === "authenticated";

  if (!isAdminSession) return false;

  // In development, the password session is enough
  if (process.env.NODE_ENV === 'development') return true;

  // In production, we also verify the Supabase UID for multi-layered security
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !ALLOWED_UIDS.includes(user.id)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
