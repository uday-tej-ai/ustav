import { Link, useParams } from "wouter";
import { useGetCategory, getGetCategoryQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function CategoryBrowse() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);

  const { data: category, isLoading } = useGetCategory(id, {
    query: { enabled: !!id, queryKey: getGetCategoryQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Category not found.</p>
        <Link href="/customer/dashboard" className="text-primary hover:underline mt-2 inline-block">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/customer/dashboard" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-serif font-bold text-primary">{category.name} Invitations</h1>
        <p className="text-muted-foreground mt-2">{category.description}</p>
        <p className="text-sm text-muted-foreground mt-1">{category.templateCount} designs available</p>
      </div>

      {category.templates.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">No templates available for this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.templates.map((template) => (
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
              <div className="p-5">
                <h3 className="font-serif font-semibold text-foreground mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold font-serif text-lg">₹{template.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground bg-primary/5 px-3 py-1 rounded-full">Customize</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
