-- AI-COO Postgres schema (initial)
-- Tables: shops, users, products, orders, inventory_events

CREATE TABLE IF NOT EXISTS shops (
  id SERIAL PRIMARY KEY,
  shop_domain TEXT NOT NULL UNIQUE,
  access_token TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metafields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  shopify_user_id BIGINT,
  email TEXT,
  name TEXT,
  role TEXT,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (shop_id, shopify_user_id)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  shopify_product_id BIGINT,
  title TEXT,
  body_html TEXT,
  vendor TEXT,
  product_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (shop_id, shopify_product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_shop ON products (shop_id);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  shopify_order_id BIGINT,
  customer_name TEXT,
  total_price NUMERIC,
  currency VARCHAR(10),
  order_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (shop_id, shopify_order_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders (shop_id);

CREATE TABLE IF NOT EXISTS inventory_events (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  event_type TEXT,
  quantity INTEGER,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_shop ON inventory_events (shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_events (product_id);
