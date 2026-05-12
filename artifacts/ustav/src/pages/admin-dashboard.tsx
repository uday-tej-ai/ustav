import { useGetAdminStats, useGetRecentOrders, getGetAdminStatsQueryKey, getGetRecentOrdersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Clock, CheckCircle, IndianRupee, LayoutGrid, Image, Users } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-serif font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: recentOrders, isLoading: ordersLoading } = useGetRecentOrders({ query: { queryKey: getGetRecentOrdersQueryKey() } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your USTAV platform</p>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-primary/10 text-primary" />
          <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} color="bg-yellow-100 text-yellow-700" />
          <StatCard label="Completed" value={stats.completedOrders} icon={CheckCircle} color="bg-green-100 text-green-700" />
          <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={IndianRupee} color="bg-accent/10 text-accent-foreground" />
          <StatCard label="Templates" value={stats.totalTemplates} icon={Image} color="bg-primary/10 text-primary" />
          <StatCard label="Categories" value={stats.totalCategories} icon={LayoutGrid} color="bg-secondary text-secondary-foreground" />
          <StatCard label="Customers" value={stats.totalCustomers} icon={Users} color="bg-primary/10 text-primary" />
        </div>
      ) : null}

      <div>
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Recent Orders</h2>
        {ordersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : !recentOrders?.length ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">No orders yet.</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} data-testid={`row-order-${order.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">#{order.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{order.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.templateName}</td>
                    <td className="px-4 py-3 font-serif font-semibold text-primary">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? ""}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
