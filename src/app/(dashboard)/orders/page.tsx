"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_OPTIONS, type OrderWithItems, type OrderItem } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${
        expanded ? "rotate-90" : ""
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatusChange,
  onEdit,
}: {
  order: OrderWithItems;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (order: OrderWithItems) => void;
}) {
  const itemCount = order.order_items?.length || 0;

  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
      >
        <td className="p-4">
          <ChevronIcon expanded={expanded} />
        </td>
        <td className="p-4 font-medium text-gray-900">
          {order.customer_name}
        </td>
        <td className="p-4 text-gray-600">{order.phone}</td>
        <td className="p-4">
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {itemCount}
          </span>
        </td>
        <td className="p-4">
          <StatusBadge status={order.status} />
        </td>
        <td className="p-4 text-gray-600">
          {order.estimated_delivery
            ? new Date(order.estimated_delivery).toLocaleDateString()
            : "-"}
        </td>
        <td className="p-4 text-right font-medium text-gray-900">
          ${(order.total_amount || 0).toFixed(2)}
        </td>
        <td className="p-4 text-right font-medium text-green-700">
          ${(order.total_profit || 0).toFixed(2)}
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={() => onEdit(order)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Edit order"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {expanded && order.order_items && order.order_items.length > 0 && (
        <tr className="bg-gray-50/50">
          <td colSpan={9} className="px-8 py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left pb-2 font-medium">Model</th>
                  <th className="text-left pb-2 font-medium">Size</th>
                  <th className="text-left pb-2 font-medium">Color</th>
                  <th className="text-left pb-2 font-medium">Qty</th>
                  <th className="text-left pb-2 font-medium">Design</th>
                  <th className="text-left pb-2 font-medium">Source</th>
                  <th className="text-right pb-2 font-medium">Cost</th>
                  <th className="text-right pb-2 font-medium">Price</th>
                  <th className="text-right pb-2 font-medium">Profit</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item: OrderItem) => (
                  <tr
                    key={item.id}
                    className="border-t border-gray-100"
                  >
                    <td className="py-2 text-gray-900 font-medium">
                      {item.model}
                    </td>
                    <td className="py-2 text-gray-600">{item.size}</td>
                    <td className="py-2 text-gray-600">{item.color}</td>
                    <td className="py-2 text-gray-600">{item.quantity}</td>
                    <td className="py-2">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt="Design"
                          className="w-16 h-16 object-contain rounded border border-gray-200 bg-gray-50"
                        />
                      ) : item.design ? (
                        <span className="text-gray-600 text-xs max-w-[150px] truncate block" title={item.design}>
                          {item.design}
                        </span>
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${
                          item.source === "stock"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {item.source === "stock" ? "Stock" : "Custom"}
                      </span>
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      ${(item.supplier_cost || 0).toFixed(2)}
                    </td>
                    <td className="py-2 text-right text-gray-600">
                      ${(item.selling_price || 0).toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-medium text-green-700">
                      ${(item.profit || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Edit Order Modal ────────────────────────────────────────────────

type EditItemData = {
  id: string;
  model: string;
  size: string;
  color: string;
  design: string;
  quantity: number;
  supplier_cost: string;
  selling_price: string;
  source: "stock" | "custom";
};

function EditOrderModal({
  order,
  onClose,
  onSaved,
}: {
  order: OrderWithItems;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState(order.customer_name);
  const [phone, setPhone] = useState(order.phone);
  const [deliveryDate, setDeliveryDate] = useState(
    order.estimated_delivery
      ? new Date(order.estimated_delivery).toISOString().split("T")[0]
      : ""
  );

  const [editItems, setEditItems] = useState<EditItemData[]>(
    order.order_items.map((item) => ({
      id: item.id,
      model: item.model,
      size: item.size,
      color: item.color,
      design: item.design || "",
      quantity: item.quantity,
      supplier_cost: item.supplier_cost.toString(),
      selling_price: item.selling_price.toString(),
      source: item.source,
    }))
  );

  function updateEditItem(index: number, field: keyof EditItemData, value: string | number) {
    setEditItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function calcItemProfit(item: EditItemData) {
    const cost = parseFloat(item.supplier_cost) || 0;
    const price = parseFloat(item.selling_price) || 0;
    return (price - cost) * (item.quantity || 1);
  }

  const totalAmount = editItems.reduce(
    (sum, item) => sum + (parseFloat(item.selling_price) || 0) * (item.quantity || 1),
    0
  );
  const totalProfit = editItems.reduce((sum, item) => sum + calcItemProfit(item), 0);

  async function handleSave() {
    setSaving(true);
    setError("");

    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        customer_name: customerName,
        phone,
        estimated_delivery: deliveryDate || null,
        total_amount: totalAmount,
        total_profit: totalProfit,
      })
      .eq("id", order.id);

    if (orderErr) {
      setError(orderErr.message);
      setSaving(false);
      return;
    }

    for (const item of editItems) {
      const profit = calcItemProfit(item);
      const { error: itemErr } = await supabase
        .from("order_items")
        .update({
          model: item.model,
          size: item.size,
          color: item.color,
          design: item.design || null,
          quantity: item.quantity,
          supplier_cost: parseFloat(item.supplier_cost) || 0,
          selling_price: parseFloat(item.selling_price) || 0,
          profit,
          source: item.source,
        })
        .eq("id", item.id);

      if (itemErr) {
        setError(`Failed to update item: ${itemErr.message}`);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Customer info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Customer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Est. Delivery</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Items</h3>
            <div className="space-y-4">
              {editItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Model</label>
                      <input
                        type="text"
                        value={item.model}
                        onChange={(e) => updateEditItem(index, "model", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Size</label>
                      <select
                        value={item.size}
                        onChange={(e) => updateEditItem(index, "size", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      >
                        {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Color</label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => updateEditItem(index, "color", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateEditItem(index, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Supplier Cost</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.supplier_cost}
                        onChange={(e) => updateEditItem(index, "supplier_cost", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Selling Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.selling_price}
                        onChange={(e) => updateEditItem(index, "selling_price", e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Profit</label>
                      <div className={`px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 font-medium ${
                        calcItemProfit(item) >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        ${calcItemProfit(item).toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Source</label>
                      <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                        <button
                          type="button"
                          onClick={() => updateEditItem(index, "source", "custom")}
                          className={`flex-1 px-2 py-1.5 font-medium transition-colors ${
                            item.source === "custom"
                              ? "bg-orange-50 text-orange-700"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          Custom
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEditItem(index, "source", "stock")}
                          className={`flex-1 px-2 py-1.5 font-medium transition-colors ${
                            item.source === "stock"
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          Stock
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs text-gray-500 mb-1">Design Description</label>
                    <input
                      type="text"
                      value={item.design}
                      onChange={(e) => updateEditItem(index, "design", e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      placeholder="Design description..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-4">
            <div>
              <span className="text-sm text-gray-500">Total Amount</span>
              <p className="text-lg font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Total Profit</span>
              <p className={`text-lg font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${totalProfit.toFixed(2)}
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
  const supabase = createClient();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data as OrderWithItems[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  }

  // Derive filtered orders
  const filteredOrders = orders.filter((order) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!order.customer_name.toLowerCase().includes(q) && !order.phone.includes(q)) {
        return false;
      }
    }
    if (statusFilter && order.status !== statusFilter) return false;
    if (dateFrom) {
      const orderDate = order.order_date?.split("T")[0] || "";
      if (orderDate < dateFrom) return false;
    }
    if (dateTo) {
      const orderDate = order.order_date?.split("T")[0] || "";
      if (orderDate > dateTo) return false;
    }
    return true;
  });

  const hasFilters = searchQuery || statusFilter || dateFrom || dateTo;

  function clearFilters() {
    setSearchQuery("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filter Bar */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Customer name or phone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="min-w-[150px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {hasFilters && (
            <p className="text-xs text-gray-500 mt-2">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No orders yet.</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No orders match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-10 p-4"></th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Customer
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Phone
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Items
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Est. Delivery
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  Total
                </th>
                <th className="text-right p-4 font-medium text-gray-500">
                  Profit
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  expanded={expandedId === order.id}
                  onToggle={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  onStatusChange={updateStatus}
                  onEdit={setEditingOrder}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={() => {
            setEditingOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
