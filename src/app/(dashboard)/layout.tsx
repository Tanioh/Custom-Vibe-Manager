import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64 p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
