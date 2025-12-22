-- Update 'place_order' to handle bundle display items (skip stock decrement for display-only items)
-- Run this in Supabase SQL Editor

create or replace function place_order(
  order_items jsonb,
  customer_email text,
  payment_code text,
  order_total numeric,
  delivery_type text,
  shipping_address text,
  customer_name text,
  customer_phone text
) returns jsonb as $$
declare
  item jsonb;
  qty int;
  sku_chk text;
  stock_avail int;
  new_order_id uuid;
  is_display_only boolean;
begin
  -- Loop through items to verify and deduct stock
  for item in select * from jsonb_array_elements(order_items) loop
    -- Skip display-only items (like bundle indicator) - they don't have stock to decrement
    is_display_only := coalesce((item->>'isBundleDisplay')::boolean, false);
    if is_display_only then
      continue;
    end if;

    sku_chk := item->>'sku';
    qty := (item->>'quantity')::int;
    
    select stock_qty into stock_avail from products where sku = sku_chk for update;
    
    if stock_avail is null then raise exception 'Product % not found', sku_chk; end if;
    if stock_avail < qty then raise exception 'Insufficient stock for %', sku_chk; end if;
    update products set stock_qty = stock_qty - qty where sku = sku_chk;
  end loop;

  -- Create the Order with new fields (stores ALL items including display items)
  insert into orders (
    customer_email, 
    order_code, 
    items, 
    status, 
    total, 
    delivery_type, 
    shipping_address,
    customer_name,
    customer_phone
  )
  values (
    customer_email, 
    payment_code, 
    order_items, 
    'pending_payment', 
    order_total, 
    delivery_type, 
    shipping_address,
    customer_name,
    customer_phone
  )
  returning id into new_order_id;

  return jsonb_build_object('order_id', new_order_id, 'status', 'success');
end;
$$ language plpgsql;
