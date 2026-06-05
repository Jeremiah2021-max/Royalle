import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq, desc, count, sum } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { normalizeOrder } from "./orders";
import { sendOrderStatusUpdateToCustomer } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();
router.use(requireAdmin);

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get("/dashboard", async (req, res) => {
  const [orderStats] = await db
    .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
    .from(ordersTable)
    .where(eq(ordersTable.paymentStatus, "paid"));

  const [pendingCount] = await db
    .select({ total: count() })
    .from(ordersTable)
    .where(eq(ordersTable.orderStatus, "pending"));

  const [shippedCount] = await db
    .select({ total: count() })
    .from(ordersTable)
    .where(eq(ordersTable.orderStatus, "shipped"));

  const [deliveredCount] = await db
    .select({ total: count() })
    .from(ordersTable)
    .where(eq(ordersTable.orderStatus, "delivered"));

  const [productCount] = await db.select({ total: count() }).from(productsTable);

  const recentOrders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(10);

  res.json({
    totalOrders: Number(orderStats?.total ?? 0),
    totalRevenue: Number(orderStats?.revenue ?? 0),
    pendingOrders: Number(pendingCount?.total ?? 0),
    shippedOrders: Number(shippedCount?.total ?? 0),
    deliveredOrders: Number(deliveredCount?.total ?? 0),
    totalProducts: Number(productCount?.total ?? 0),
    recentOrders: recentOrders.map(normalizeOrder),
  });
});

// ── Products ───────────────────────────────────────────────────────────────
router.get("/products", async (_req, res) => {
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));
  res.json(products.map((p) => ({ ...p, price: Number(p.price) })));
});

router.post("/products", async (req, res) => {
  const body = req.body as {
    name: string;
    description?: string;
    price: number;
    imageUrl: string;
    category?: string;
    options?: string;
    status: string;
    stock?: number;
  };
  const [product] = await db
    .insert(productsTable)
    .values({
      name: body.name,
      description: body.description ?? null,
      price: String(body.price),
      imageUrl: body.imageUrl,
      category: body.category ?? null,
      options: body.options ?? null,
      status: body.status ?? "available",
      stock: body.stock ?? 0,
    })
    .returning();
  res.status(201).json({ ...product, price: Number(product.price) });
});

router.put("/products/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body as Partial<{
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    options: string;
    status: string;
    stock: number;
  }>;
  const update: Record<string, unknown> = {};
  if (body.name !== undefined) update["name"] = body.name;
  if (body.description !== undefined) update["description"] = body.description;
  if (body.price !== undefined) update["price"] = String(body.price);
  if (body.imageUrl !== undefined) update["imageUrl"] = body.imageUrl;
  if (body.category !== undefined) update["category"] = body.category;
  if (body.options !== undefined) update["options"] = body.options;
  if (body.status !== undefined) update["status"] = body.status;
  if (body.stock !== undefined) update["stock"] = body.stock;

  const [product] = await db.update(productsTable).set(update).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ...product, price: Number(product.price) });
});

router.delete("/products/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// ── Orders ─────────────────────────────────────────────────────────────────
router.get("/orders", async (_req, res) => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(orders.map(normalizeOrder));
});

router.patch("/orders/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const body = req.body as {
    paymentStatus?: string;
    orderStatus?: string;
    deliveryNotes?: string;
  };

  const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const update: Record<string, unknown> = {};
  if (body.paymentStatus) update["paymentStatus"] = body.paymentStatus;
  if (body.orderStatus) update["orderStatus"] = body.orderStatus;
  if (body.deliveryNotes !== undefined) update["deliveryNotes"] = body.deliveryNotes;

  const [order] = await db.update(ordersTable).set(update).where(eq(ordersTable.id, id)).returning();

  // Send status update email if order status changed
  if (body.orderStatus && body.orderStatus !== existing.orderStatus) {
    sendOrderStatusUpdateToCustomer(
      existing.customerEmail,
      existing.customerName,
      existing.reference,
      body.orderStatus
    ).catch((err) => logger.error({ err }, "Failed to send status update email"));
  }

  res.json(normalizeOrder(order));
});

export default router;
