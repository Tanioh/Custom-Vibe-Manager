import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .returns<Order[]>();

  const allOrders = orders || [];
  const totalOrders = allOrders.length;
  const inProduction = allOrders.filter((o) => o.status === "In Production").length;
  const ready = allOrders.filter((o) => o.status === "Ready").length;
  const totalProfit = allOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + (o.profit || 0), 0);

  const cards = [
    { label: "Total Orders", value: totalOrders, color: "bg-blue-50 text-blue-700" },
    { label: "In Production", value: inProduction, color: "bg-yellow-50 text-yellow-700" },
    { label: "Ready", value: ready, color: "bg-green-50 text-green-700" },
    { label: "Total Profit", value: `$${totalProfit.toFixed(2)}`, color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color} inline-block px-3 py-1 rounded-lg`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
