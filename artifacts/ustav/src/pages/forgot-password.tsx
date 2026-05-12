import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const forgotMutation = useForgotPassword();
  const [sent, setSent] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: FormValues) => {
    forgotMutation.mutate(
      { data: values },
      {
        onSuccess: () => setSent(true),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif font-bold text-primary tracking-tight">USTAV</Link>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-serif text-foreground">Reset Password</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send a reset reminder.</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Check Your Inbox</h3>
              <p className="text-muted-foreground text-sm mb-6">
                If an account exists for that email, a password reset link has been sent.
              </p>
              <Link href="/customer/login" className="text-primary font-medium hover:underline text-sm">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Email Address</FormLabel>
                        <FormControl>
                          <Input data-testid="input-email" type="email" placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button data-testid="button-reset" type="submit" className="w-full" disabled={forgotMutation.isPending}>
                    {forgotMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Send Reset Link
                  </Button>
                </form>
              </Form>
              <div className="mt-6 text-center">
                <Link href="/customer/login" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
