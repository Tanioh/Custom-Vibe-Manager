-- =============================================
-- CustomVibe Admin - Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Create the orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  model text not null,
  size text not null,
  color text not null,
  design text,
  supplier_cost numeric not null default 0,
  selling_price numeric not null default 0,
  profit numeric not null default 0,
  status text not null default 'Waiting Supplier',
  order_date timestamp with time zone not null default now(),
  estimated_delivery timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table orders enable row level security;

-- Policy: Allow authenticated users full access
create policy "Authenticated users can read orders"
  on orders for select
  to authenticated
  using (true);

create policy "Authenticated users can insert orders"
  on orders for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update orders"
  on orders for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete orders"
  on orders for delete
  to authenticated
  using (true);
