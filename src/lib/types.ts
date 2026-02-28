export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  status: string;
  total_amount: number;
  total_profit: number;
  order_date: string;
  estimated_delivery: string;
  created_at: string;
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  model: string;
  size: string;
  color: string;
  design: string;
  quantity: number;
  supplier_cost: number;
  selling_price: number;
  profit: number;
  source: "stock" | "custom";
  image_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  created_at: string;
};

export type InventoryItem = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  quantity_available: number;
  created_at: string;
};

export type InventoryWithProduct = InventoryItem & {
  products: Pick<Product, "name" | "base_price" | "image_url">;
};

export type OrderItemFormData = {
  model: string;
  size: string;
  color: string;
  design: string;
  quantity: number;
  supplier_cost: string;
  selling_price: string;
  source: "stock" | "custom";
  image_file: File | null;
};

export const STATUS_OPTIONS = [
  "Waiting Supplier",
  "In Production",
  "Ready",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof STATUS_OPTIONS)[number];

export const LOW_STOCK_THRESHOLD = 5;
