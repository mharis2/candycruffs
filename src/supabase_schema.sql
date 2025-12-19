-- 1. Create 'products' table
create table products (
  sku text primary key,
  name text,
  stock_qty integer default 0
);

-- 2. Create 'orders' table
create table orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text,
  order_code text,
  items jsonb,
  status text default 'pending_payment',
  created_at timestamp with time zone default now(),
  customer_info jsonb -- Storing full customer details for reference
);

-- 3. Enable Realtime for 'products'
alter publication supabase_realtime add table products;

-- 4. Create the 'place_order' RPC function
create or replace function place_order(
  order_details jsonb,
  customer_info jsonb
) returns jsonb as $$
declare
  item jsonb;
  qty int;
  sku_chk text;
  stock_avail int;
  new_order_id uuid;
  order_code_val text := order_details->>'orderCode';
begin
  -- Iterate through items to check stock and decrement
  for item in select * from jsonb_array_elements(order_details->'items')
  loop
    sku_chk := item->>'id'; -- We store SKU in the 'id' field of the item or 'sku' if we change frontend
    if sku_chk is null then
        -- Fallback if id is not the SKU, check logic. 
        -- Frontend sends: { id: 'prism-pops', size: 'Bag', ... } 
        -- But wait, frontend logic maps quantities by "productId_sizeId".
        -- The item object in frontend has 'id' as product ID.
        -- We need the actual SKU. 
        -- NOTE: The frontend must send the SKU in the order items.
        sku_chk := item->>'sku';
    end if;

    qty := (item->>'quantity')::int;

    if sku_chk is null then
       raise exception 'SKU not provided for item';
    end if;

    -- Lock the row for update
    select stock_qty into stock_avail from products where sku = sku_chk for update;

    if stock_avail is null then
        raise exception 'Product % not found', sku_chk;
    end if;

    if stock_avail < qty then
        raise exception 'Insufficient stock for %', sku_chk;
    end if;

    -- Decrement stock
    update products set stock_qty = stock_qty - qty where sku = sku_chk;
  end loop;

  -- Create order
  insert into orders (customer_name, order_code, items, status, customer_info)
  values (
    customer_info->>'name',
    order_code_val,
    order_details->'items',
    'pending_payment',
    customer_info
  ) returning id into new_order_id;

  return jsonb_build_object('order_id', new_order_id, 'status', 'success');
end;
$$ language plpgsql;
