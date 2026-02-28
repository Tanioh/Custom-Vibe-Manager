import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .returns<Order[]>();

  const { data: items } = await supabase
    .from("order_items")
    .select("size, quantity, profit, order_id")
    .returns<Pick<OrderItem, "size" | "quantity" | "profit" | "order_id">[]>();

  const allOrders = orders || [];
  const allItems = items || [];
  const activeOrders = allOrders.filter((o) => o.status !== "Cancelled");
  const cancelledIds = new Set(
    allOrders.filter((o) => o.status === "Cancelled").map((o) => o.id)
  );
  const activeItems = allItems.filter((i) => !cancelledIds.has(i.order_id));

  const totalProfit = activeOrders.reduce((sum, o) => sum + (o.total_profit || 0), 0);
  const totalOrders = allOrders.length;

  // Most sold size (by quantity from order_items)
  const sizeCounts: Record<string, number> = {};
  activeItems.forEach((item) => {
    sizeCounts[item.size] = (sizeCounts[item.size] || 0) + (item.quantity || 1);
  });
  const mostSoldSize =
    Object.entries(sizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Monthly summary
  const monthlySummary: Record<string, { orders: number; profit: number }> = {};
  activeOrders.forEach((o) => {
    const date = new Date(o.order_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlySummary[key]) {
      monthlySummary[key] = { orders: 0, profit: 0 };
    }
    monthlySummary[key].orders += 1;
    monthlySummary[key].profit += o.total_profit || 0;
  });

  const sortedMonths = Object.entries(monthlySummary).sort(
    (a, b) => b[0].localeCompare(a[0])
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Profit" value={`$${totalProfit.toFixed(2)}`} color="text-green-700 bg-green-50" />
        <StatCard label="Total Orders" value={totalOrders.toString()} color="text-blue-700 bg-blue-50" />
        <StatCard label="Most Sold Size" value={mostSoldSize} color="text-purple-700 bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Summary</h2>
        </div>

        {sortedMonths.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 font-medium text-gray-500">Month</th>
                <th className="text-right p-4 font-medium text-gray-500">Orders</th>
                <th className="text-right p-4 font-medium text-gray-500">Profit</th>
              </tr>
            </thead>
            <tbody>
              {sortedMonths.map(([month, data]) => (
                <tr key={month} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">
                    {formatMonth(month)}
                  </td>
                  <td className="p-4 text-right text-gray-600">{data.orders}</td>
                  <td className="p-4 text-right font-medium text-green-700">
                    ${data.profit.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color} inline-block px-3 py-1 rounded-lg`}>
        {value}
      </p>
    </div>
  );
}

function formatMonth(key: string) {
  const [year, month] = key.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}
