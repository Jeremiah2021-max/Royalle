import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StoreNav() {
  const [location] = useLocation();
  const { cartCount } = useCart();

  if (location === "/" || location.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Napong Ahenema King" className="h-9 w-9 object-contain" />
            <span className="font-serif text-lg font-bold text-primary hidden lg:block">Napong Ahenema King</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/track" className="text-sm font-medium hover:text-primary transition-colors">
              Track Order
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/track">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
              <Search className="h-4 w-4" />
              Track
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="icon" className="relative" data-testid="link-cart-nav">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
