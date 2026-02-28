"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OrderItemFormData } from "@/lib/types";

const emptyItem: OrderItemFormData = {
  model: "",
  size: "",
  color: "",
  design: "",
  quantity: 1,
  supplier_cost: "",
  selling_price: "",
  source: "custom",
};

export default function AddOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({ name: "", phone: "" });
  const [items, setItems] = useState<OrderItemFormData[]>([{ ...emptyItem }]);

  function updateItem(index: number, field: keyof OrderItemFormData, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function calcItemProfit(item: OrderItemFormData) {
    const cost = parseFloat(item.supplier_cost) || 0;
    const price = parseFloat(item.selling_price) || 0;
    return (price - cost) * (item.quantity || 1);
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + (parseFloat(item.selling_price) || 0) * (item.quantity || 1),
    0
  );
  const totalProfit = items.reduce((sum, item) => sum + calcItemProfit(item), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const now = new Date();
    const estimatedDelivery = new Date(now);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const supabase = createClient();

    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        phone: customer.phone,
        status: "Waiting Supplier",
        total_amount: totalAmount,
        total_profit: totalProfit,
        order_date: now.toISOString(),
        estimated_delivery: estimatedDelivery.toISOString(),
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      setError(orderError?.message || "Failed to create order");
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      model: item.model,
      size: item.size,
      color: item.color,
      design: item.design,
      quantity: item.quantity,
      supplier_cost: parseFloat(item.supplier_cost) || 0,
      selling_price: parseFloat(item.selling_price) || 0,
      profit: calcItemProfit(item),
      source: item.source,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", orderData.id);
      setError(itemsError.message);
      setLoading(false);
      return;
    }

    router.push("/orders");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Customer Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer Name" required>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer((p) => ({ ...p, name: e.target.value }))}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </Field>
            <Field label="Phone" required>
              <input
                type="text"
                value={customer.phone}
                onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                required
                className="input-field"
                placeholder="+1 234 567 890"
              />
            </Field>
          </div>
        </div>

        {/* Items */}
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Item {index + 1}</h2>
              <div className="flex items-center gap-3">
                {/* Source Toggle */}
                <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => updateItem(index, "source", "custom")}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      item.source === "custom"
                        ? "bg-orange-50 text-orange-700"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Custom
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItem(index, "source", "stock")}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      item.source === "stock"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    Stock
                  </button>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Model" required>
                <input
                  type="text"
                  value={item.model}
                  onChange={(e) => updateItem(index, "model", e.target.value)}
                  required
                  className="input-field"
                  placeholder="Classic Tee"
                />
              </Field>
              <Field label="Size" required>
                <select
                  value={item.size}
                  onChange={(e) => updateItem(index, "size", e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </Field>
              <Field label="Color" required>
                <input
                  type="text"
                  value={item.color}
                  onChange={(e) => updateItem(index, "color", e.target.value)}
                  required
                  className="input-field"
                  placeholder="Black"
                />
              </Field>
              <Field label="Quantity" required>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                  required
                  className="input-field"
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Design Description">
                <textarea
                  value={item.design}
                  onChange={(e) => updateItem(index, "design", e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Describe the design..."
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Field label="Supplier Cost ($)" required>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.supplier_cost}
                  onChange={(e) => updateItem(index, "supplier_cost", e.target.value)}
                  required
                  className="input-field"
                  placeholder="0.00"
                />
              </Field>
              <Field label="Selling Price ($)" required>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.selling_price}
                  onChange={(e) => updateItem(index, "selling_price", e.target.value)}
                  required
                  className="input-field"
                  placeholder="0.00"
                />
              </Field>
              <Field label="Item Profit ($)">
                <div
                  className={`input-field bg-gray-50 flex items-center font-semibold ${
                    calcItemProfit(item) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${calcItemProfit(item).toFixed(2)}
                </div>
              </Field>
            </div>
          </div>
        ))}

        {/* Add Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          + Add Another Item
        </button>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Create Order"}
        </button>
      </form>

      <style jsx>{`
        :global(.input-field) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
        }
        :global(.input-field:focus) {
          box-shadow: 0 0 0 2px #111827;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
