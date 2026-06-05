import { useEffect } from "react";
import { Link } from "wouter";
import { useVerifyPayment, useGetOrderByReference } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallback() {
  const searchParams = new URLSearchParams(window.location.search);
  const reference = searchParams.get("reference") || "";
  const { clearCart } = useCart();

  const {
    data: verifyData,
    isLoading: isVerifying,
    isError: verifyError,
  } = useVerifyPayment(reference, {
    query: { enabled: !!reference } as any,
  });

  const { data: order, isLoading: isOrderLoading } = useGetOrderByReference(reference, {
    query: { enabled: !!reference && !!verifyData } as any,
  });

  useEffect(() => {
    if (verifyData?.status === "success") {
      clearCart();
    }
  }, [verifyData, clearCart]);

  if (!reference) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-4">Payment Error</h2>
          <p className="text-muted-foreground mb-8">No payment reference found.</p>
          <Link href="/cart">
            <Button>Return to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isVerifying || isOrderLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
        <h2 className="text-2xl font-serif font-bold">Verifying Payment...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we confirm your transaction.</p>
      </div>
    );
  }

  if (verifyError || !verifyData || verifyData.status !== "success") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center container mx-auto px-4">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold mb-4">Payment Failed</h2>
          <p className="text-muted-foreground mb-8">
            Payment verification failed or payment was not successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cart">
              <Button variant="outline" className="w-full sm:w-auto">Return to Cart</Button>
            </Link>
            <Link href="/checkout">
              <Button className="w-full sm:w-auto">Try Again</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-10">
        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-serif font-bold mb-4">Order Confirmed!</h1>
        <p className="text-lg text-muted-foreground">
          Thank you for your purchase. Your payment was successful and your order is being processed.
        </p>
      </div>

      {order && (
        <Card className="overflow-hidden border-border/50 shadow-md">
          <div className="bg-muted p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Reference</p>
                <p className="font-mono font-bold text-lg">{order.reference}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 mt-1 capitalize">
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="font-serif font-bold text-xl mb-4">Delivery Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm mb-8">
              <div>
                <p className="text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">{order.customerName}</p>
                <p>{order.customerEmail}</p>
                <p>{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Address</p>
                <p className="font-medium">{order.deliveryAddress}</p>
                <p>{[order.city, order.region].filter(Boolean).join(", ")}</p>
                {order.deliveryNotes && (
                  <p className="italic mt-1 text-xs">Note: {order.deliveryNotes}</p>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="font-serif font-bold text-xl mb-4">Order Summary</h3>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex gap-4">
                    <div className="font-medium">{item.quantity}x</div>
                    <div className="text-muted-foreground">{item.productName}</div>
                  </div>
                  <div className="font-medium">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-primary">GH₵{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-10 text-center">
        <Link href="/shop">
          <Button size="lg" className="px-8">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
