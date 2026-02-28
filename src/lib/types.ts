export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  model: string;
  size: string;
  color: string;
  design: string;
  supplier_cost: number;
  selling_price: number;
  profit: number;
  status: string;
  order_date: string;
  estimated_delivery: string;
  created_at: string;
};

export const STATUS_OPTIONS = [
  "Waiting Supplier",
  "In Production",
  "Ready",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof STATUS_OPTIONS)[number];
