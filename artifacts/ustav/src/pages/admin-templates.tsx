import { useState } from "react";
import {
  useListTemplates,
  useListCategories,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  getListTemplatesQueryKey,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Trash2, Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Template } from "@workspace/api-client-react";

const schema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Please enter a valid image URL"),
  price: z.string().min(1, "Price is required"),
  isFeatured: z.boolean().default(false),
});
type FormValues = z.infer<typeof schema>;

export default function AdminTemplates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  const { data: templates, isLoading } = useListTemplates(undefined, { query: { queryKey: getListTemplatesQueryKey() } });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  const deleteMutation = useDeleteTemplate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: "", name: "", description: "", imageUrl: "", price: "", isFeatured: false },
  });

  const openNew = () => {
    setEditing(null);
    form.reset({ categoryId: "", name: "", description: "", imageUrl: "", price: "", isFeatured: false });
    setDialogOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditing(t);
    form.reset({
      categoryId: String(t.categoryId),
      name: t.name,
      description: t.description,
      imageUrl: t.imageUrl,
      price: String(t.price),
      isFeatured: t.isFeatured,
    });
    setDialogOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      categoryId: parseInt(values.categoryId, 10),
      name: values.name,
      description: values.description,
      imageUrl: values.imageUrl,
      price: parseFloat(values.price),
      isFeatured: values.isFeatured,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
            setDialogOpen(false);
            toast({ title: "Template updated" });
          },
          onError: () => toast({ title: "Error", description: "Failed to update template", variant: "destructive" }),
        }
      );
    } else {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
            setDialogOpen(false);
            toast({ title: "Template created" });
          },
          onError: () => toast({ title: "Error", description: "Failed to create template", variant: "destructive" }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this template?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
          toast({ title: "Template deleted" });
        },
        onError: () => toast({ title: "Error", description: "Failed to delete template", variant: "destructive" }),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-primary">Invitation Templates</h1>
        <Button data-testid="button-add-template" onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      ) : !templates?.length ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          No templates yet. Upload your first invitation design.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div key={t.id} data-testid={`card-template-${t.id}`} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-muted relative">
                <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                {t.isFeatured && (
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-semibold text-foreground">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.categoryName}</p>
                  </div>
                  <span className="font-serif font-bold text-primary">₹{t.price.toLocaleString()}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button data-testid={`button-edit-template-${t.id}`} variant="outline" size="sm" className="flex-1" onClick={() => openEdit(t)}>
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button data-testid={`button-delete-template-${t.id}`} variant="outline" size="sm" onClick={() => handleDelete(t.id)} disabled={deleteMutation.isPending}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "Edit Template" : "Add New Template"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl><Input data-testid="input-template-name" placeholder="e.g. Royal Rajwada Wedding" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea data-testid="input-template-description" placeholder="Brief description..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input data-testid="input-template-image" placeholder="https://..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl><Input data-testid="input-template-price" type="number" min="0" step="1" placeholder="e.g. 499" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="mb-0">Featured Design</FormLabel>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <FormControl>
                    <Switch data-testid="switch-featured" checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button data-testid="button-save-template" type="submit" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editing ? "Update" : "Create"} Template
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
