import { ReactNode, useEffect } from "react";
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

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setLocation(role === "admin" ? "/admin/login" : "/customer/login");
      return;
    }
    if (role && user.role !== role) {
      setLocation(user.role === "admin" ? "/admin/dashboard" : "/customer/dashboard");
    }
  }, [user, isLoading, role, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;
  if (role && user.role !== role) return null;

  return <>{children}</>;
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const [location] = useLocation();
  const isActive = location === href || location.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors ${
        isActive
          ? "text-primary border-b-2 border-primary pb-0.5"
          : "text-foreground/70 hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
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
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-primary tracking-tight">
            USTAV
          </Link>
          <nav className="flex items-center gap-6">
            {user ? (
              <>
                {user.role === "admin" ? (
                  <>
                    <NavLink href="/admin/dashboard">Dashboard</NavLink>
                    <NavLink href="/admin/categories">Categories</NavLink>
                    <NavLink href="/admin/templates">Templates</NavLink>
                    <NavLink href="/admin/orders">Orders</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink href="/customer/dashboard">Browse</NavLink>
                    <NavLink href="/customer/orders">My Orders</NavLink>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
                  {logoutMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink href="/customer/login">Customer Login</NavLink>
                <NavLink href="/admin/login">Admin Login</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        {children}
      </main>
      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted-foreground text-sm font-serif">
          © {new Date().getFullYear()} USTAV. Celebrating traditions.
        </div>
      </footer>
    </div>
  );
}
