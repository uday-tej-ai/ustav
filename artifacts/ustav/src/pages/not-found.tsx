import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-serif font-bold text-primary/20 mb-4">404</div>
      <h1 className="text-2xl font-serif font-bold text-primary mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        The page you're looking for doesn't exist. It may have been moved or the URL might be incorrect.
      </p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
