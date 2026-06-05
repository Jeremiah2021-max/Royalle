import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";

const DELIVERY_FEE = 20;

export default function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground">Looks like you haven't added any traditional wear or accessories to your cart yet.</p>
          <Link href="/shop" className="inline-block mt-4">
            <Button size="lg" className="gap-2">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              {items.map((item, index) => (
                <div key={item.productId}>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6">
                    <img 
                      src={item.imageUrl} 
                      alt={item.productName} 
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-serif font-semibold text-lg">{item.productName}</h3>
                      <p className="text-primary font-medium mt-1">GH₵{item.unitPrice.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                      <div className="flex items-center border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-r-none border-0"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-qty-${item.productId}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center font-medium text-sm" data-testid={`text-qty-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-l-none border-0"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          data-testid={`button-increase-qty-${item.productId}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right w-24 hidden sm:block font-semibold">
                        GH₵{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.productId)}
                        data-testid={`button-remove-item-${item.productId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                  <span className="font-medium">GH₵{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">GH₵{DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">GH₵{(cartTotal + DELIVERY_FEE).toFixed(2)}</span>
                </div>
              </div>
              
              <Link href="/checkout" className="block mt-6">
                <Button size="lg" className="w-full" data-testid="button-proceed-checkout">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
