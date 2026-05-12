import { useListOrders, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders, isLoading } = useListOrders({ query: { queryKey: getListOrdersQueryKey() } });
  const updateMutation = useUpdateOrder();

  const handleStatusChange = (id: number, status: OrderStatus) => {
    updateMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order status updated" });
        },
        onError: () => toast({ title: "Error", description: "Failed to update status", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-primary">All Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : !orders?.length ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Template</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event Details</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} data-testid={`row-order-${order.id}`} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">#{order.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{order.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[150px] truncate">{order.templateName}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {order.customization?.hostName && <div>{order.customization.hostName}</div>}
                    {order.customization?.eventDate && <div>{new Date(order.customization.eventDate).toLocaleDateString("en-IN")}</div>}
                  </td>
                  <td className="px-4 py-3 font-serif font-semibold text-primary">₹{order.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                    >
                      <SelectTrigger data-testid={`select-status-${order.id}`} className="h-8 w-32 text-xs">
                        <SelectValue>
                          <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? ""}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
