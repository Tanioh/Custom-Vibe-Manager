export default function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Waiting Supplier": "bg-yellow-50 text-yellow-700 border-yellow-200",
    "In Production": "bg-blue-50 text-blue-700 border-blue-200",
    "Ready": "bg-green-50 text-green-700 border-green-200",
    "Delivered": "bg-gray-50 text-gray-700 border-gray-200",
    "Cancelled": "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${
        colors[status] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}
