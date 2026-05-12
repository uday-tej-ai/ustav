import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout, RequireAuth } from "@/components/layout";
import Landing from "@/pages/landing";
import CustomerLogin from "@/pages/customer-login";
import CustomerRegister from "@/pages/customer-register";
import AdminLogin from "@/pages/admin-login";
import AdminRegister from "@/pages/admin-register";
import ForgotPassword from "@/pages/forgot-password";
import CustomerDashboard from "@/pages/customer-dashboard";
import CategoryBrowse from "@/pages/category-browse";
import TemplateDetail from "@/pages/template-detail";
import CustomerOrders from "@/pages/customer-orders";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminCategories from "@/pages/admin-categories";
import AdminTemplates from "@/pages/admin-templates";
import AdminOrders from "@/pages/admin-orders";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />

      <Route path="/customer/login" component={CustomerLogin} />
      <Route path="/customer/register" component={CustomerRegister} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/forgot-password" component={ForgotPassword} />

      <Route path="/customer/dashboard">
        <RequireAuth role="customer">
          <AppLayout><CustomerDashboard /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/customer/category/:id">
        <RequireAuth role="customer">
          <AppLayout><CategoryBrowse /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/customer/template/:id">
        <RequireAuth role="customer">
          <AppLayout><TemplateDetail /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/customer/orders">
        <RequireAuth role="customer">
          <AppLayout><CustomerOrders /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/admin/dashboard">
        <RequireAuth role="admin">
          <AppLayout><AdminDashboard /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/admin/categories">
        <RequireAuth role="admin">
          <AppLayout><AdminCategories /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/admin/templates">
        <RequireAuth role="admin">
          <AppLayout><AdminTemplates /></AppLayout>
        </RequireAuth>
      </Route>

      <Route path="/admin/orders">
        <RequireAuth role="admin">
          <AppLayout><AdminOrders /></AppLayout>
        </RequireAuth>
      </Route>

      <Route>
        <AppLayout><NotFound /></AppLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
