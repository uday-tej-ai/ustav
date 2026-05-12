import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role?: "customer" | "admin";
}) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation(role === "admin" ? "/admin/login" : "/customer/login");
    return null;
  }

  if (role && user.role !== role) {
    setLocation(user.role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
    return null;
  }

  return <>{children}</>;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-primary">
            USTAV
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === "admin" ? (
                  <>
                    <Link href="/admin/dashboard" className="text-sm font-medium hover:text-primary">Dashboard</Link>
                    <Link href="/admin/categories" className="text-sm font-medium hover:text-primary">Categories</Link>
                    <Link href="/admin/templates" className="text-sm font-medium hover:text-primary">Templates</Link>
                    <Link href="/admin/orders" className="text-sm font-medium hover:text-primary">Orders</Link>
                  </>
                ) : (
                  <>
                    <Link href="/customer/dashboard" className="text-sm font-medium hover:text-primary">Home</Link>
                    <Link href="/customer/orders" className="text-sm font-medium hover:text-primary">My Orders</Link>
                  </>
                )}
                <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
                  {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/customer/login" className="text-sm font-medium hover:text-primary">Customer Login</Link>
                <Link href="/admin/login" className="text-sm font-medium hover:text-primary">Admin Login</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-card mt-auto py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground font-serif">
          <p>© {new Date().getFullYear()} USTAV. Celebrating traditions.</p>
        </div>
      </footer>
    </div>
  );
}
