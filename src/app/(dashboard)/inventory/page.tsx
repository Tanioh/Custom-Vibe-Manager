"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, InventoryWithProduct } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/lib/types";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    const [{ data: p }, { data: inv }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase
        .from("inventory")
        .select("*, products(name, base_price)")
        .order("created_at", { ascending: false }),
    ]);
    setProducts((p as Product[]) || []);
    setInventory((inv as InventoryWithProduct[]) || []);
    setLoading(false);
  }

  const lowStockCount = inventory.filter(
    (i) => i.quantity_available <= LOW_STOCK_THRESHOLD
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Add Product
          </button>
          <button
            onClick={() => setShowAddStock(!showAddStock)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-6 text-sm">
          Warning: {lowStockCount} item{lowStockCount > 1 ? "s" : ""} running
          low on stock.
        </div>
      )}

      {showAddProduct && (
        <AddProductForm
          onDone={() => {
            setShowAddProduct(false);
            fetchData();
          }}
          onCancel={() => setShowAddProduct(false)}
        />
      )}

      {showAddStock && (
        <AddStockForm
          products={products}
          onDone={() => {
            setShowAddStock(false);
            fetchData();
          }}
          onCancel={() => setShowAddStock(false)}
        />
      )}

      {/* Stock Table */}
      {inventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No stock entries yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-500">
                  Product
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Size
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Color
                </th>
                <th className="text-center p-4 font-medium text-gray-500">
                  Available
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <StockRow
                  key={item.id}
                  item={item}
                  onUpdate={fetchData}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StockRow({
  item,
  onUpdate,
}: {
  item: InventoryWithProduct;
  onUpdate: () => void;
}) {
  const [qty, setQty] = useState(item.quantity_available.toString());
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleUpdate() {
    setSaving(true);
    await supabase
      .from("inventory")
      .update({ quantity_available: parseInt(qty) || 0 })
      .eq("id", item.id);
    setSaving(false);
    onUpdate();
  }

  const status =
    item.quantity_available === 0
      ? { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200" }
      : item.quantity_available <= LOW_STOCK_THRESHOLD
        ? {
            label: "Low Stock",
            cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
          }
        : {
            label: "In Stock",
            cls: "bg-green-50 text-green-700 border-green-200",
          };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50">
      <td className="p-4 font-medium text-gray-900">
        {item.products?.name || "Unknown"}
      </td>
      <td className="p-4 text-gray-600">{item.size}</td>
      <td className="p-4 text-gray-600">{item.color}</td>
      <td className="p-4 text-center font-medium text-gray-900">
        {item.quantity_available}
      </td>
      <td className="p-4">
        <span
          className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${status.cls}`}
        >
          {status.label}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <input
            type="number"
            min="0"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {saving ? "..." : "Update"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddProductForm({
  onDone,
  onCancel,
}: {
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: err } = await supabase.from("products").insert({
      name,
      description: description || null,
      base_price: parseFloat(basePrice) || 0,
    });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Add Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Classic Tee"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Product"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AddStockForm({
  products,
  onDone,
  onCancel,
}: {
  products: Product[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: err } = await supabase.from("inventory").upsert(
      {
        product_id: productId,
        size,
        color,
        quantity_available: parseInt(quantity) || 0,
      },
      { onConflict: "product_id,size,color" }
    );

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    onDone();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Stock</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size <span className="text-red-500">*</span>
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Stock"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
