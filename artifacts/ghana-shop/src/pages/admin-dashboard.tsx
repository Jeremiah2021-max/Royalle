import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useAdminGetDashboard, 
  useAdminListProducts, 
  useAdminListOrders,
  useAdminCreateProduct,
  useAdminUpdateProduct,
  useAdminDeleteProduct,
  useAdminUpdateOrder,
  useRequestUploadUrl,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LayoutDashboard, Package, ShoppingBag, LogOut, Plus, Edit, Trash2, PackageOpen, CheckCircle, TrendingUp, Star, Upload, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("adminToken");
    if (!savedToken) {
      setLocation("/admin/login");
    } else {
      setToken(savedToken);
    }
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    setLocation("/admin/login");
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border/50 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-10 pl-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-serif text-lg font-bold text-primary">Napong Ahenema King</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Button 
            variant={activeTab === "dashboard" ? "secondary" : "ghost"} 
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("dashboard")}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
          </Button>
          <Button 
            variant={activeTab === "products" ? "secondary" : "ghost"} 
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("products")}
            data-testid="nav-products"
          >
            <Package className="mr-3 h-5 w-5" /> Products
          </Button>
          <Button 
            variant={activeTab === "orders" ? "secondary" : "ghost"} 
            className="w-full justify-start font-medium"
            onClick={() => setActiveTab("orders")}
            data-testid="nav-orders"
          >
            <ShoppingBag className="mr-3 h-5 w-5" /> Orders
          </Button>
        </nav>
        
        <div className="pt-8 border-t mt-auto">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        {activeTab === "dashboard" && <DashboardView token={token} />}
        {activeTab === "products" && <ProductsView token={token} />}
        {activeTab === "orders" && <OrdersView token={token} />}
      </main>
    </div>
  );
}

function DashboardView({ token }: { token: string }) {
  const { data: stats, isLoading } = useAdminGetDashboard({ 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">GH₵{stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            <PackageOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.pendingOrders || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.deliveredOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-serif font-bold pt-6">Recent Orders</h2>
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats?.recentOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">{order.reference}</TableCell>
                <TableCell className="font-medium">{order.customerName}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-semibold text-primary">GH₵{order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={order.paymentStatus === "paid" ? "text-green-600 border-green-500/30 bg-green-500/10" : ""}>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{order.orderStatus}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {!stats?.recentOrders?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No recent orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

const PRODUCT_CATEGORIES = ["Male Footwear", "Female Footwear", "Accessories"];

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  options: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  status: z.enum(["available", "coming_soon", "preorder"]),
});

function ProductsView({ token }: { token: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: products, isLoading } = useAdminListProducts({ 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });
  
  const createProduct = useAdminCreateProduct({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const updateProduct = useAdminUpdateProduct({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const deleteProduct = useAdminDeleteProduct({ request: { headers: { Authorization: `Bearer ${token}` } } });
  const requestUploadUrl = useRequestUploadUrl();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: 0, stock: 0, category: "Male Footwear", options: "", imageUrl: "", status: "available"
    },
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: { name: file.name, size: file.size, contentType: file.type },
      });
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      form.setValue("imageUrl", `/api/storage/objects/${objectPath}`, { shouldValidate: true });
      toast({ title: "Image uploaded successfully" });
    } catch {
      toast({ variant: "destructive", title: "Image upload failed" });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ id: editingProduct.id, data: values });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync({ data: values });
        toast({ title: "Product created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsAddOpen(false);
      setEditingProduct(null);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Error saving product" });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      stock: product.stock ?? 0,
      category: product.category || "Male Footwear",
      options: product.options || "",
      imageUrl: product.imageUrl || "",
      status: product.status || "available",
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct.mutateAsync({ id });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
        toast({ title: "Product deleted" });
      } catch (error) {
        toast({ variant: "destructive", title: "Error deleting product" });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your catalog and inventory.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setEditingProduct(null);
            form.reset({ name: "", description: "", price: 0, stock: 0, category: "Male Footwear", options: "", imageUrl: "", status: "available" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-product">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g. Kente Sandals" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price (GH₵)</FormLabel><FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="stock" render={({ field }) => (
                    <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Availability Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available — in stock now</SelectItem>
                        <SelectItem value="coming_soon">Coming Soon — not yet available</SelectItem>
                        <SelectItem value="preorder">Pre-Order — ships later</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <div className="flex gap-2 items-center">
                      <FormControl>
                        <Input placeholder="https://... or upload below" {...field} className="flex-1" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        disabled={imageUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imageUploading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        ) : (
                          <><Upload className="h-4 w-4" /> Upload</>
                        )}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                    </div>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-2 rounded-md overflow-hidden border border-border/50 w-24 h-24">
                        <img src={field.value} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                      </div>
                    )}
                  </FormItem>
                )} />

                <FormField control={form.control} name="options" render={({ field }) => (
                  <FormItem><FormLabel>Options <span className="text-muted-foreground font-normal">(optional)</span></FormLabel><FormControl><Input placeholder="e.g. Black, Size 42; White and Gold, Large" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={3} placeholder="Describe the product..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} data-testid="button-save-product">
                    {createProduct.isPending || updateProduct.isPending ? "Saving..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading products...</TableCell></TableRow>
            ) : products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded border" />
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  {product.category && <div className="text-xs text-muted-foreground">{product.category}</div>}
                </TableCell>
                <TableCell>GH₵{product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock ?? 0}</TableCell>
                <TableCell>
                  <Badge variant={product.status === "available" ? "default" : "secondary"} className="capitalize">
                    {product.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title={product.featured === "true" ? "Remove from featured" : "Mark as featured"}
                      onClick={async () => {
                        try {
                          await updateProduct.mutateAsync({ id: product.id, data: { featured: product.featured === "true" ? "false" : "true" } });
                          queryClient.invalidateQueries();
                          toast({ title: product.featured === "true" ? "Removed from featured" : "Marked as featured" });
                        } catch {
                          toast({ title: "Failed to update featured status", variant: "destructive" });
                        }
                      }}
                    >
                      <Star className={`h-4 w-4 ${product.featured === "true" ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} data-testid={`btn-edit-${product.id}`}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)} data-testid={`btn-del-${product.id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function OrdersView({ token }: { token: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  
  const { data: orders, isLoading } = useAdminListOrders({ 
    request: { headers: { Authorization: `Bearer ${token}` } } 
  });
  
  const updateOrder = useAdminUpdateOrder({ request: { headers: { Authorization: `Bearer ${token}` } } });

  const handleStatusUpdate = async (id: number, type: "paymentStatus" | "orderStatus", value: string) => {
    try {
      await updateOrder.mutateAsync({
        id,
        data: { [type]: value }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: `Order ${type.replace("Status", "")} updated` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error updating order" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground mt-1">Track and fulfill customer orders.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Loading orders...</TableCell></TableRow>
            ) : orders?.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <TableCell className="font-mono text-xs font-semibold text-primary">{order.reference}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{order.customerName}</TableCell>
                  <TableCell className="font-semibold">GH₵{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select 
                      defaultValue={order.paymentStatus} 
                      onValueChange={(val) => handleStatusUpdate(order.id, "paymentStatus", val)}
                    >
                      <SelectTrigger className={`h-8 w-28 text-xs ${order.paymentStatus === 'paid' ? 'border-green-500/50 text-green-600 bg-green-500/5' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Select 
                      defaultValue={order.orderStatus} 
                      onValueChange={(val) => handleStatusUpdate(order.id, "orderStatus", val)}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                {expandedOrder === order.id && (
                  <TableRow className="bg-muted/10">
                    <TableCell colSpan={6} className="p-0 border-b">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Delivery Details</h4>
                          <div className="text-sm space-y-1 bg-background p-4 rounded-md border">
                            <p><span className="font-medium">Name:</span> {order.customerName}</p>
                            <p><span className="font-medium">Email:</span> {order.customerEmail}</p>
                            <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                            <div className="my-2 border-t pt-2"></div>
                            <p><span className="font-medium">Address:</span> {order.deliveryAddress}</p>
                            <p><span className="font-medium">Location:</span> {order.city}{order.city && order.region ? ", " : ""}{order.region}</p>
                            {order.deliveryNotes && (
                              <p className="mt-2 text-xs text-muted-foreground italic break-words">Note: {order.deliveryNotes}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Order Items</h4>
                          <div className="space-y-3 bg-background p-4 rounded-md border">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex gap-3">
                                  <Badge variant="outline">{item.quantity}x</Badge>
                                  <span>Product #{item.productId}</span>
                                </div>
                                <span className="font-medium text-primary">GH₵{(item.unitPrice * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="mt-4 pt-3 border-t flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-primary text-base">GH₵{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Ensure React is available for the React.Fragment implicitly or explicitly
import React from "react";
