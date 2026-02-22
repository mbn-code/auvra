# Auvra Society Membership Setup Guide

## 1. Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor to enable the membership system:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles for Membership
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    membership_tier TEXT DEFAULT 'free', -- free, society
    stripe_customer_id TEXT,
    subscription_status TEXT, -- active, past_due, canceled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile (optional but good practice)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 2. Stripe Setup
1. Go to **Stripe Dashboard > Products**.
2. Click **+ Add Product**.
3. Name: `Auvra Society Access`.
4. Pricing Model: **Recurring**.
5. Price: **€19.00** / Month.
6. Click **Save Product**.
7. Copy the **Price ID** (starts with `price_...`).
8. Add this ID to your Vercel Environment Variables as `STRIPE_SUBSCRIPTION_PRICE_ID`.

## 3. Webhook Update
The webhook is already configured to listen for `checkout.session.completed`. When a subscription is purchased, it will automatically update the user's `membership_tier` to `society`.

## 4. Verification
1. Sign up on the site.
2. Go to `/pricing`.
3. Complete the checkout.
4. You will be redirected to `/account` and see your new status.
