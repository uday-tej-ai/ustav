import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useListCategories, useListTemplates, getListCategoriesQueryKey, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Star, ArrowRight } from "lucide-react";

const categoryIcons: Record<string, string> = {
  wedding: "💍",
  birthday: "🎂",
  housewarming: "🏠",
  "baby-shower": "👶",
  engagement: "💑",
  festival: "🪔",
};

export default function Landing() {
  const { data: categories, isLoading: catsLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });
  const { data: featuredTemplates, isLoading: featLoading } = useListTemplates(
    { featured: true },
    { query: { queryKey: getListTemplatesQueryKey({ featured: true }) } }
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          <div className="text-3xl font-serif font-bold text-primary tracking-tight">USTAV</div>
          <nav className="flex items-center gap-6">
            <Link href="/customer/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Customer Login
            </Link>
            <Button asChild size="sm">
              <Link href="/admin/login">Admin</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative py-24 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-transparent pointer-events-none" />
          <div className="relative max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <Star className="h-3.5 w-3.5 text-accent fill-accent" />
              Premium Indian Invitation Cards
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6 leading-tight">
              Invitations as Beautiful<br />as the Occasion
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-serif leading-relaxed">
              Premium, deeply crafted invitation cards for weddings, birthdays, and housewarmings — rooted in Indian celebration culture.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8">
                <Link href="/customer/register">Start Planning</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8">
                <Link href="/customer/login">Browse Designs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Ornament divider */}
        <div className="flex items-center justify-center py-4 gap-4 px-6">
          <div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-border" />
          <span className="text-primary/30 text-xs tracking-widest">✦ ✦ ✦</span>
          <div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Event Categories */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-foreground">Browse by Event</h2>
              <p className="text-muted-foreground mt-2">Every celebration deserves a card crafted for the occasion</p>
            </div>
            {catsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href="/customer/register"
                    className="group flex flex-col items-center justify-center p-5 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md hover:bg-primary/5 transition-all text-center cursor-pointer"
                  >
                    <div className="text-3xl mb-3 transition-transform group-hover:scale-110">
                      {categoryIcons[cat.slug] ?? "✦"}
                    </div>
                    <span className="font-serif font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">{cat.templateCount} designs</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Designs */}
        <section className="py-16 px-6 bg-gradient-to-b from-primary/3 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                  <h2 className="text-3xl font-serif font-bold text-foreground">Featured Designs</h2>
                </div>
                <p className="text-muted-foreground">Handpicked designs loved by our customers</p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex items-center gap-1">
                <Link href="/customer/register">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {featLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredTemplates?.map((template) => (
                  <Link
                    key={template.id}
                    href="/customer/register"
                    className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif font-semibold text-foreground">{template.name}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{template.categoryName}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold font-serif text-lg">₹{template.price.toLocaleString()}</span>
                        <span className="text-sm text-primary font-medium group-hover:underline">Customize</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
              <Heart className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-serif font-bold text-primary mb-3">
                Your celebration deserves the perfect invitation
              </h2>
              <p className="text-muted-foreground mb-8 font-serif">
                Create a free account and start customizing from our library of handcrafted Indian invitation designs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/customer/register">Create Free Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/customer/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-serif font-bold text-primary mb-2">USTAV</div>
          <p className="text-muted-foreground text-sm">Celebrating traditions, one invitation at a time.</p>
          <p className="text-muted-foreground text-xs mt-4">© {new Date().getFullYear()} USTAV. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
