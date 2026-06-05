import { useState } from "react";
import { useGetOrderByReference } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

const ORDER_STEPS = [
  { key: "pending",    label: "Order Placed",    icon: Clock,         desc: "Your order has been received." },
  { key: "confirmed",  label: "Confirmed",        icon: CheckCircle,   desc: "Your order is confirmed." },
  { key: "processing", label: "Processing",       icon: Package,       desc: "Your order is being prepared." },
  { key: "shipped",    label: "Shipped",          icon: Truck,         desc: "Your order is on the way!" },
  { key: "delivered",  label: "Delivered",        icon: CheckCircle,   desc: "Your order has been delivered." },
];

function getStepIndex(status: string) {
  return ORDER_STEPS.findIndex((s) => s.key === status);
}

export default function TrackOrder() {
  const [inputRef, setInputRef] = useState("");
  const [searchRef, setSearchRef] = useState("");

  const { data: order, isLoading, error } = useGetOrderByReference(searchRef, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { enabled: !!searchRef, retry: false } as any,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputRef.trim().toUpperCase();
    if (trimmed) setSearchRef(trimmed);
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : -1;

  const paymentBadge = () => {
    if (!order) return null;
    const map: Record<string, { label: string; className: string }> = {
      paid:     { label: "Paid",     className: "bg-green-100 text-green-800 border-green-200" },
      pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      failed:   { label: "Failed",   className: "bg-red-100 text-red-800 border-red-200" },
      refunded: { label: "Refunded", className: "bg-blue-100 text-blue-800 border-blue-200" },
    };
    const entry = map[order.paymentStatus] ?? { label: order.paymentStatus, className: "" };
    return <Badge variant="outline" className={entry.className}>{entry.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-background border-b border-border/50">
        <div className="container mx-auto px-4 py-8 text-center">
          <Link href="/" className="inline-block font-serif text-2xl font-bold text-primary mb-4">
            Napong Ahenema King
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Track Your Order</h1>
          <p className="text-muted-foreground mt-2">Enter your order reference number to check your delivery status</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Search Box */}
        <Card className="shadow-sm border-border/50 mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                placeholder="e.g. GS-1748912345-ABC12"
                value={inputRef}
                onChange={(e) => setInputRef(e.target.value)}
                className="flex-1 h-12 font-mono text-sm"
              />
              <Button type="submit" size="lg" className="h-12 px-6" disabled={isLoading || !inputRef.trim()}>
                {isLoading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Searching...</span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="h-4 w-4" /> Track</span>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">Your order reference was sent in your confirmation email (format: GS-XXXXXXXXXX-XXXXX)</p>
          </CardContent>
        </Card>

        {/* Error */}
        {error && searchRef && (
          <Card className="border-destructive/30 bg-destructive/5 mb-8">
            <CardContent className="pt-6 flex items-center gap-3 text-destructive">
              <XCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Order not found</p>
                <p className="text-sm text-muted-foreground mt-1">No order with reference <span className="font-mono font-semibold">{searchRef}</span> was found. Please check and try again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Result */}
        {order && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle className="text-lg">Order {order.reference}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {paymentBadge()}
                    <Badge variant={order.orderStatus === "delivered" ? "default" : "secondary"} className="capitalize">
                      {order.orderStatus.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Delivery Status Timeline */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" /> Delivery Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {ORDER_STEPS.map((step, i) => {
                    const isDone = i <= currentStep;
                    const isCurrent = i === currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Connector line */}
                        {i < ORDER_STEPS.length - 1 && (
                          <div className={`absolute left-[18px] top-9 w-0.5 h-8 ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                        )}
                        {/* Icon */}
                        <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCurrent
                            ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20"
                            : isDone
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        {/* Text */}
                        <div className={`pb-8 ${i === ORDER_STEPS.length - 1 ? "pb-0" : ""}`}>
                          <p className={`font-semibold text-sm ${isDone ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                          {(isDone || isCurrent) && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" /> Items Ordered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{item.quantity}</div>
                        <span className="text-sm font-medium">{item.productName}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">GH₵{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Details */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{order.deliveryAddress}</p>
                      {(order.city || order.region) && (
                        <p className="text-muted-foreground">{[order.city, order.region].filter(Boolean).join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{order.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{order.customerEmail}</span>
                  </div>
                  {order.deliveryNotes && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 text-muted-foreground italic text-xs">
                      Note: {order.deliveryNotes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link href="/shop">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Prompt before any search */}
        {!searchRef && !order && (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Enter your order reference above</p>
            <p className="text-sm mt-1">Check the confirmation email you received after placing your order</p>
          </div>
        )}
      </div>
    </div>
  );
}
