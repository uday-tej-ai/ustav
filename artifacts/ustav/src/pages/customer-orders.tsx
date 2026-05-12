import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Package } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function CustomerOrders() {
  const { data: orders, isLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Browse our beautiful invitation designs to get started.</p>
          <Link href="/customer/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Browse Designs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              data-testid={`card-order-${order.id}`}
              className="bg-card border border-border rounded-xl p-5 flex gap-5 hover:shadow-sm transition-shadow"
            >
              {order.templateImageUrl && (
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img src={order.templateImageUrl} alt={order.templateName ?? ""} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif font-semibold text-foreground truncate">{order.templateName}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0 ${statusColors[order.status] ?? ""}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.customization?.hostName && <span>For: {order.customization.hostName}</span>}
                  {order.customization?.eventDate && <span> · {new Date(order.customization.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Order #{order.id}</span>
                  <span className="font-serif font-bold text-primary">₹{order.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
