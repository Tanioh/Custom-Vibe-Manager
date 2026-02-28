-- =============================================
-- CustomVibe Admin - Migration: Multi-Item Orders + Inventory
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- =============================================
-- STEP 1: Create new tables
-- =============================================

-- 1a. order_items table
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references orders(id) on delete cascade,
  model text not null,
  size text not null,
  color text not null,
  design text,
  quantity integer not null default 1,
  supplier_cost numeric not null default 0,
  selling_price numeric not null default 0,
  profit numeric not null default 0,
  source text not null default 'custom' check (source in ('stock', 'custom')),
  created_at timestamp with time zone default now()
);

-- 1b. products table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  base_price numeric not null default 0,
  created_at timestamp with time zone default now()
);

-- 1c. inventory table
create table if not exists inventory (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  quantity_available integer not null default 0,
  created_at timestamp with time zone default now(),
  unique(product_id, size, color)
);

-- =============================================
-- STEP 2: Add new columns to orders table
-- =============================================

alter table orders add column if not exists total_amount numeric not null default 0;
alter table orders add column if not exists total_profit numeric not null default 0;

-- =============================================
-- STEP 3: Migrate existing data
-- Each existing order row becomes one order + one order_item
-- =============================================

-- 3a. Populate total_amount and total_profit from existing flat fields
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'selling_price') then
    execute 'update orders set total_amount = selling_price, total_profit = profit where total_amount = 0 and selling_price > 0';
  end if;
end $$;

-- 3b. Create one order_item per existing order
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'model') then
    execute '
      insert into order_items (order_id, model, size, color, design, quantity, supplier_cost, selling_price, profit, source)
      select id, model, size, color, design, 1, supplier_cost, selling_price, profit, ''custom''
      from orders
      where not exists (select 1 from order_items where order_items.order_id = orders.id)
    ';
  end if;
end $$;

-- =============================================
-- STEP 4: Drop old item-level columns from orders
-- =============================================

alter table orders drop column if exists model;
alter table orders drop column if exists size;
alter table orders drop column if exists color;
alter table orders drop column if exists design;
alter table orders drop column if exists supplier_cost;
alter table orders drop column if exists selling_price;
alter table orders drop column if exists profit;

-- =============================================
-- STEP 5: Enable RLS on new tables
-- =============================================

alter table order_items enable row level security;
alter table products enable row level security;
alter table inventory enable row level security;

-- order_items policies
create policy "Authenticated users can read order_items"
  on order_items for select to authenticated using (true);
create policy "Authenticated users can insert order_items"
  on order_items for insert to authenticated with check (true);
create policy "Authenticated users can update order_items"
  on order_items for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete order_items"
  on order_items for delete to authenticated using (true);

-- products policies
create policy "Authenticated users can read products"
  on products for select to authenticated using (true);
create policy "Authenticated users can insert products"
  on products for insert to authenticated with check (true);
create policy "Authenticated users can update products"
  on products for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete products"
  on products for delete to authenticated using (true);

-- inventory policies
create policy "Authenticated users can read inventory"
  on inventory for select to authenticated using (true);
create policy "Authenticated users can insert inventory"
  on inventory for insert to authenticated with check (true);
create policy "Authenticated users can update inventory"
  on inventory for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete inventory"
  on inventory for delete to authenticated using (true);

-- =============================================
-- STEP 6: Create indexes for performance
-- =============================================

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_inventory_product_id on inventory(product_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_order_date on orders(order_date);

-- =============================================
-- STEP 7: Helper function to deduct stock atomically
-- =============================================

create or replace function deduct_inventory(
  p_product_id uuid,
  p_size text,
  p_color text,
  p_quantity integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_available integer;
begin
  select quantity_available into v_available
  from inventory
  where product_id = p_product_id
    and size = p_size
    and color = p_color
  for update;

  if v_available is null or v_available < p_quantity then
    return false;
  end if;

  update inventory
  set quantity_available = quantity_available - p_quantity
  where product_id = p_product_id
    and size = p_size
    and color = p_color;

  return true;
end;
$$;

-- =============================================
-- STEP 8: Add image support
-- =============================================

alter table order_items add column if not exists image_url text;
alter table products add column if not exists image_url text;

-- NOTE: You must also create a Storage bucket in Supabase Dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Name: "images", set to Public
-- 3. Add policy: allow authenticated users to SELECT, INSERT, UPDATE, DELETE
