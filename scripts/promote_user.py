import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load Environment
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in environment.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def promote_user(email: str):
    print(f"🚀 Promoting user {email} to Society Membership...")
    
    try:
        # 1. Check if profile exists
        response = supabase.table("profiles").select("id").eq("email", email).execute()
        
        if not response.data:
            print(f"⚠️ Profile for {email} not found. Attempting to create one from auth.users...")
            # We need to find the user in auth.users first. 
            # Note: This requires service role which we have in SUPABASE_SERVICE_ROLE_KEY
            auth_user = supabase.auth.admin.list_users()
            user = next((u for u in auth_user.users if u.email == email), None)
            
            if not user:
                print(f"❌ Error: User with email {email} not found in Supabase Auth.")
                return
            
            print(f"✅ Found Auth User: {user.id}. Creating profile...")
            supabase.table("profiles").insert({
                "id": user.id,
                "email": email,
                "membership_tier": "society",
                "subscription_status": "active"
            }).execute()
            print(f"✅ Success! {email} profile created and promoted.")
            return

        user_id = response.data[0]['id']
        
        # 2. Update membership_tier
        update_res = supabase.table("profiles").update({
            "membership_tier": "society",
            "subscription_status": "active"
        }).eq("id", user_id).execute()
        
        if update_res.data:
            print(f"✅ Success! {email} is now a member of The Society.")
        else:
            print("❌ Failed to update profile.")

    except Exception as e:
        print(f"🔥 Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/promote_user.py user@example.com")
    else:
        promote_user(sys.argv[1])
