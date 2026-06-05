import { useState, useMemo } from "react";
import { useListProducts } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, X, SlidersHorizontal } from "lucide-react";
import { useLocation } from "wouter";

const CATEGORIES = ["All", "Male Footwear", "Female Footwear", "Accessories"];
const AVAILABILITY = ["All", "available", "coming_soon", "preorder"];
const AVAILABILITY_LABELS: Record<string, string> = {
  All: "All",
  available: "Available",
  coming_soon: "Coming Soon",
  preorder: "Pre-Order",
};

const STATUS_COLORS: Record<string, string> = {
  available: "bg-green-500/10 text-green-700 border-green-500/30",
  coming_soon: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  preorder: "bg-blue-500/10 text-blue-700 border-blue-500/30",
};

export default function Shop() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useListProducts();
  const { addToCart, cartCount } = useCart();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [availability, setAvailability] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "All" && p.category !== category) return false;
      if (availability !== "All" && p.status !== availability) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
  }, [products, search, category, availability, minPrice, maxPrice]);

  const activeFilterCount = [
    category !== "All",
    availability !== "All",
    !!minPrice,
    !!maxPrice,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("All");
    setAvailability("All");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  const handleAddToCart = (product: NonNullable<typeof products>[number]) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      imageUrl: product.imageUrl,
      quantity: 1,
      unitPrice: product.price,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Page Header */}
      <div className="border-b border-border/50 bg-card/60 sticky top-[57px] z-20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8"
              data-testid="input-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                data-testid="button-clear-search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter toggle on mobile */}
          <Button
            variant="outline"
            className="sm:hidden gap-2"
            onClick={() => setShowFilters((v) => !v)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {activeFilterCount > 0 && <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilterCount}</Badge>}
          </Button>

          {/* Desktop filters inline */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <FilterChips
              category={category} setCategory={setCategory}
              availability={availability} setAvailability={setAvailability}
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            />
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-8" data-testid="button-clear-filters">
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="sm:hidden border-t border-border/40 bg-card px-4 py-4 space-y-4">
            <FilterChips
              category={category} setCategory={setCategory}
              availability={availability} setAvailability={setAvailability}
              minPrice={minPrice} setMinPrice={setMinPrice}
              maxPrice={maxPrice} setMaxPrice={setMaxPrice}
            />
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground" data-testid="button-clear-filters-mobile">
                <X className="h-3.5 w-3.5 mr-1" /> Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Heading + count */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-3xl font-serif font-bold">
            {category !== "All" ? category : "Our Collection"}
          </h1>
          {!isLoading && (
            <span className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </span>
          )}
        </div>

        {/* Category tab bar */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              data-testid={`filter-category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-foreground/70 hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-serif font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters} data-testid="button-reset-filters">
              Reset all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden flex flex-col group border-border/40 hover:shadow-xl transition-all duration-300"
                data-testid={`card-product-${product.id}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <Badge
                    variant="outline"
                    className={`absolute top-3 right-3 z-10 capitalize text-xs font-medium border ${STATUS_COLORS[product.status] ?? ""}`}
                  >
                    {AVAILABILITY_LABELS[product.status] ?? product.status.replace(/_/g, " ")}
                  </Badge>
                  {product.category && (
                    <Badge variant="secondary" className="absolute top-3 left-3 z-10 text-xs">
                      {product.category}
                    </Badge>
                  )}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-4 flex-grow">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
                    <span className="font-semibold text-primary whitespace-nowrap">GH₵{product.price.toFixed(2)}</span>
                  </div>
                  {product.options && (
                    <p className="text-xs text-muted-foreground mb-1">{product.options}</p>
                  )}
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.status === "coming_soon"}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    {product.status === "coming_soon" ? "Coming Soon" : product.status === "preorder" ? "Pre-Order" : "Add to Cart"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            className="rounded-full shadow-lg h-16 px-6 gap-2"
            onClick={() => setLocation("/cart")}
            data-testid="button-floating-cart"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="font-bold text-lg">{cartCount}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterChips({
  category, setCategory,
  availability, setAvailability,
  minPrice, setMinPrice,
  maxPrice, setMaxPrice,
}: {
  category: string; setCategory: (v: string) => void;
  availability: string; setAvailability: (v: string) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Availability select */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground sm:hidden">Availability</label>
        <div className="flex gap-1 flex-wrap">
          {AVAILABILITY.map((a) => (
            <button
              key={a}
              onClick={() => setAvailability(a)}
              data-testid={`filter-availability-${a}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                availability === a
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-foreground/70 hover:border-primary/50"
              }`}
            >
              {AVAILABILITY_LABELS[a]}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground shrink-0">GH₵</span>
        <Input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 h-8 text-xs"
          data-testid="input-min-price"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <Input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 h-8 text-xs"
          data-testid="input-max-price"
        />
      </div>
    </div>
  );
}
