# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up/login with GitHub
4. Click "New Project"
5. Select your organization
6. **Project Details:**
   - Name: `invoice-generator`
   - Database Password: Create a strong password
   - Region: Choose closest to your users
7. Click "Create new project"

## 2. Set up Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: `http://localhost:8080`
3. **Redirect URLs**: Add `http://localhost:8080/**`
4. **Enable email signup**: Make sure it's enabled

## 3. Create Database Tables

Go to **SQL Editor** → **New query** and run:

```sql
-- Create users profile table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoices_status_idx ON invoices(status);
CREATE INDEX clients_user_id_idx ON clients(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile."
  ON profiles FOR SELECT
  USING ( auth.uid() = id );

-- Users can update their own profile
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices."
  ON invoices FOR SELECT
  USING ( auth.uid() = user_id );

-- Users can create their own invoices
CREATE POLICY "Users can create own invoices."
  ON invoices FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Users can update their own invoices
CREATE POLICY "Users can update own invoices."
  ON invoices FOR UPDATE
  USING ( auth.uid() = user_id );

-- Users can delete their own invoices
CREATE POLICY "Users can delete own invoices."
  ON invoices FOR DELETE
  USING ( auth.uid() = user_id );

-- Users can view their own clients
CREATE POLICY "Users can view own clients."
  ON clients FOR SELECT
  USING ( auth.uid() = user_id );

-- Users can create their own clients
CREATE POLICY "Users can create own clients."
  ON clients FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Users can update their own clients
CREATE POLICY "Users can update own clients."
  ON clients FOR UPDATE
  USING ( auth.uid() = user_id );

-- Users can delete their own clients
CREATE POLICY "Users can delete own clients."
  ON clients FOR DELETE
  USING ( auth.uid() = user_id );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 4. Get Project Credentials

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** and **anon public key**
3. Update your frontend code with these values

## 5. Install Supabase Client

In your project root, install the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js
```

Or include via CDN in your HTML:

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
```
