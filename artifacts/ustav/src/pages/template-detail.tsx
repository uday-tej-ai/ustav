import { useParams, useLocation } from "wouter";
import { useGetTemplate, useCreateOrder, getGetTemplateQueryKey, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  hostName: z.string().min(1, "Host name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  venue: z.string().min(1, "Venue is required"),
  guestName: z.string().optional(),
  rsvpDetails: z.string().optional(),
  customMessage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function TemplateDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [ordered, setOrdered] = useState(false);

  const { data: template, isLoading } = useGetTemplate(id, {
    query: { enabled: !!id, queryKey: getGetTemplateQueryKey(id) },
  });

  const createOrderMutation = useCreateOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hostName: "",
      eventDate: "",
      eventTime: "",
      venue: "",
      guestName: "",
      rsvpDetails: "",
      customMessage: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    createOrderMutation.mutate(
      {
        data: {
          templateId: id,
          customization: values,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          setOrdered(true);
          toast({ title: "Order placed!", description: "Your invitation order has been placed successfully." });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? "Failed to place order. Please try again.";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Template not found.</p>
        <Link href="/customer/dashboard" className="text-primary hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  if (ordered) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-primary mb-2">Order Placed!</h2>
        <p className="text-muted-foreground mb-6">Your invitation is being prepared with love.</p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/customer/orders">View My Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/customer/dashboard">Continue Browsing</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/customer/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-border shadow-sm">
            <img src={template.imageUrl} alt={template.name} className="w-full object-cover" />
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h1 className="text-2xl font-serif font-bold text-primary mb-1">{template.name}</h1>
            {template.categoryName && (
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">{template.categoryName}</span>
            )}
            <p className="text-muted-foreground mt-3 text-sm">{template.description}</p>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-2xl font-serif font-bold text-primary">₹{template.price.toLocaleString()}</span>
              <span className="text-muted-foreground text-sm ml-2">per set</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-serif font-semibold text-foreground mb-6">Customize Your Invitation</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="hostName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host / Couple Name *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-hostName" placeholder="e.g. Priya & Rahul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input data-testid="input-eventDate" type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Time *</FormLabel>
                      <FormControl>
                        <Input data-testid="input-eventTime" type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-venue" placeholder="Full venue address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guestName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guest Name (optional)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-guestName" placeholder="For personalized invites" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Details (optional)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-rsvpDetails" placeholder="Contact number or email for RSVP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea data-testid="input-customMessage" placeholder="A special note for your guests..." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                data-testid="button-order"
                type="submit"
                className="w-full mt-2"
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShoppingBag className="h-4 w-4 mr-2" />}
                Place Order — ₹{template.price.toLocaleString()}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
