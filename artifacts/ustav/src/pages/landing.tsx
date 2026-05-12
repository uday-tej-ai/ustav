import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="text-3xl font-serif font-bold text-primary tracking-tight">USTAV</div>
          <nav className="flex gap-4">
            <Link href="/customer/login" className="text-sm font-medium hover:text-primary flex items-center">
              Customer Login
            </Link>
            <Link href="/admin/login" className="text-sm font-medium hover:text-primary flex items-center">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>
      
      <main>
        <section className="py-24 px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6">
            Invitations as Beautiful<br/>as the Occasion
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-serif">
            Premium, deeply crafted invitation cards for weddings, birthdays, and housewarmings rooted in Indian celebration culture.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/customer/register" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Start Planning
            </Link>
            <Link href="/customer/login" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              Browse Designs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
