"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STATUS_OPTIONS, type Order } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
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
                <th className="text-left p-4 font-medium text-gray-500">Customer</th>
                <th className="text-left p-4 font-medium text-gray-500">Phone</th>
                <th className="text-left p-4 font-medium text-gray-500">Model</th>
                <th className="text-left p-4 font-medium text-gray-500">Size</th>
                <th className="text-left p-4 font-medium text-gray-500">Color</th>
                <th className="text-left p-4 font-medium text-gray-500">Status</th>
                <th className="text-left p-4 font-medium text-gray-500">Est. Delivery</th>
                <th className="text-right p-4 font-medium text-gray-500">Profit</th>
                <th className="text-left p-4 font-medium text-gray-500">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{order.customer_name}</td>
                  <td className="p-4 text-gray-600">{order.phone}</td>
                  <td className="p-4 text-gray-600">{order.model}</td>
                  <td className="p-4 text-gray-600">{order.size}</td>
                  <td className="p-4 text-gray-600">{order.color}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4 text-gray-600">
                    {order.estimated_delivery
                      ? new Date(order.estimated_delivery).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-900">
                    ${(order.profit || 0).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
