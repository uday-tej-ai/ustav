import { Link } from "wouter";
import { useListCategories, useListTemplates, useGetMe, getListCategoriesQueryKey, getListTemplatesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";

export default function CustomerDashboard() {
  const { data: user } = useGetMe();
  const { data: categories, isLoading: catsLoading } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const { data: featuredTemplates, isLoading: featLoading } = useListTemplates(
    { featured: true },
    { query: { queryKey: getListTemplatesQueryKey({ featured: true }) } }
  );

  return (
    <div className="space-y-12">
      <section className="text-center py-10 bg-gradient-to-b from-primary/5 to-transparent rounded-2xl px-6">
        <h1 className="text-4xl font-serif font-bold text-primary mb-3">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-lg font-serif">
          Create invitation cards as beautiful as your celebrations.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-semibold text-foreground">Browse by Event</h2>
        </div>
        {catsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/customer/category/${cat.id}`}
                data-testid={`card-category-${cat.id}`}
                className="group flex flex-col items-center justify-center p-5 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <span className="font-serif font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{cat.templateCount} designs</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-accent fill-accent" />
          <h2 className="text-2xl font-serif font-semibold text-foreground">Featured Designs</h2>
        </div>
        {featLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTemplates?.map((template) => (
              <Link
                key={template.id}
                href={`/customer/template/${template.id}`}
                data-testid={`card-template-${template.id}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif font-semibold text-sm text-foreground line-clamp-1">{template.name}</span>
                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                  <span className="text-primary font-bold font-serif">₹{template.price.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
