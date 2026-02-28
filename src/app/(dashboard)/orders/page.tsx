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
}: {
  order: OrderWithItems;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
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
          <select
            value={order.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(order.id, e.target.value);
            }}
            className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

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

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-500">No orders yet.</p>
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
                  Update
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  expanded={expandedId === order.id}
                  onToggle={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                  onStatusChange={updateStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
