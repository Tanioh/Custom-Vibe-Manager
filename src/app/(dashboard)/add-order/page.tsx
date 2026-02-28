"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    model: "",
    size: "",
    color: "",
    design: "",
    supplier_cost: "",
    selling_price: "",
  });

  const profit =
    form.selling_price && form.supplier_cost
      ? parseFloat(form.selling_price) - parseFloat(form.supplier_cost)
      : 0;

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const now = new Date();
    const estimatedDelivery = new Date(now);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("orders").insert({
      customer_name: form.customer_name,
      phone: form.phone,
      model: form.model,
      size: form.size,
      color: form.color,
      design: form.design,
      supplier_cost: parseFloat(form.supplier_cost),
      selling_price: parseFloat(form.selling_price),
      profit: profit,
      status: "Waiting Supplier",
      order_date: now.toISOString(),
      estimated_delivery: estimatedDelivery.toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/orders");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Order</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer Name" required>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => updateField("customer_name", e.target.value)}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </Field>

            <Field label="Phone" required>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                required
                className="input-field"
                placeholder="+1 234 567 890"
              />
            </Field>

            <Field label="Model" required>
              <input
                type="text"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
                required
                className="input-field"
                placeholder="Classic Tee"
              />
            </Field>

            <Field label="Size" required>
              <select
                value={form.size}
                onChange={(e) => updateField("size", e.target.value)}
                required
                className="input-field"
              >
                <option value="">Select size</option>
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
                value={form.color}
                onChange={(e) => updateField("color", e.target.value)}
                required
                className="input-field"
                placeholder="Black"
              />
            </Field>
          </div>

          <Field label="Design Description">
            <textarea
              value={form.design}
              onChange={(e) => updateField("design", e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Describe the design..."
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Field label="Supplier Cost ($)" required>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.supplier_cost}
                onChange={(e) => updateField("supplier_cost", e.target.value)}
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
                value={form.selling_price}
                onChange={(e) => updateField("selling_price", e.target.value)}
                required
                className="input-field"
                placeholder="0.00"
              />
            </Field>

            <Field label="Profit ($)">
              <div className={`input-field bg-gray-50 flex items-center font-semibold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${profit.toFixed(2)}
              </div>
            </Field>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>

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
