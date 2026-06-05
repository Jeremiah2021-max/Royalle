import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, useInitializePayment } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", "Northern", 
  "Volta", "Upper East", "Upper West", "Brong-Ahafo", "Oti", "Ahafo", 
  "Bono East", "North East", "Savannah", "Western North"
];

const DELIVERY_FEE = 20;

const formSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  deliveryAddress: z.string().min(5, "Address is required"),
  deliveryCity: z.string().min(2, "City is required"),
  deliveryRegion: z.string().min(2, "Region is required"),
  deliveryNotes: z.string().optional(),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, cartTotal } = useCart();
  const { toast } = useToast();
  
  const createOrder = useCreateOrder();
  const initPayment = useInitializePayment();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      deliveryAddress: "",
      deliveryCity: "",
      deliveryRegion: "",
      deliveryNotes: "",
    },
  });

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsProcessing(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      
      const totalAmount = cartTotal + DELIVERY_FEE;

      const orderResult = await createOrder.mutateAsync({
        data: {
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          customerPhone: values.customerPhone,
          deliveryAddress: values.deliveryAddress,
          city: values.deliveryCity,
          region: values.deliveryRegion,
          deliveryNotes: values.deliveryNotes,
          items: orderItems,
        }
      });
      
      const paymentResult = await initPayment.mutateAsync({
        data: {
          email: values.customerEmail,
          amount: totalAmount,
          orderId: orderResult.id,
          reference: orderResult.reference,
        }
      });

      if (paymentResult.authorizationUrl) {
        window.location.href = paymentResult.authorizationUrl;
      } else {
        throw new Error("Could not initialize payment");
      }
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again.",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-serif font-semibold mb-6">Delivery Information</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Kwame Mensah" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="kwame@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="024 123 4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Independence Ave" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="deliveryCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Accra" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryRegion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GHANA_REGIONS.map(region => (
                                <SelectItem key={region} value={region}>{region}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deliveryNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any specific instructions for delivery?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 flex justify-end">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full md:w-auto px-10" 
                      disabled={isProcessing}
                      data-testid="button-submit-checkout"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Place Order & Pay"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 bg-muted/30">
            <CardContent className="p-6">
              <h2 className="text-xl font-serif font-bold mb-6">Your Order</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.imageUrl} alt={item.productName} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-semibold text-primary">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">GH₵{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">GH₵{DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">GH₵{(cartTotal + DELIVERY_FEE).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
