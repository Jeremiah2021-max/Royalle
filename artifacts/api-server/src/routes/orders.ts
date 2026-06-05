import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendOrderConfirmationToCustomer, sendOrderNotificationToAdmin } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();

function generateReference(): string {
  return "GS-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
}

router.post("/", async (req, res) => {
  const body = req.body as {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    city?: string;
    region?: string;
    deliveryNotes?: string;
    items: Array<{ productId: number; productName: string; quantity: number; unitPrice: number }>;
  };

  if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.deliveryAddress || !body.items?.length) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const totalAmount = body.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const reference = generateReference();

  const [order] = await db
    .insert(ordersTable)
    .values({
      reference,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      city: body.city ?? null,
      region: body.region ?? null,
      deliveryNotes: body.deliveryNotes ?? null,
      items: body.items,
      totalAmount: String(totalAmount),
      paymentStatus: "pending",
      orderStatus: "pending",
    })
    .returning();

  // Send emails (non-blocking)
  const emailData = {
    reference,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    deliveryAddress: body.deliveryAddress,
    city: body.city,
    region: body.region,
    items: body.items,
    totalAmount,
  };

  sendOrderConfirmationToCustomer(emailData).catch((err) =>
    logger.error({ err }, "Failed to send customer email")
  );
  sendOrderNotificationToAdmin(emailData).catch((err) =>
    logger.error({ err }, "Failed to send admin email")
  );

  res.status(201).json(normalizeOrder(order));
});

router.get("/:reference", async (req, res) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.reference, req.params["reference"]!));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(normalizeOrder(order));
});

function normalizeOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    totalAmount: Number(o.totalAmount),
    items: o.items as Array<{ productId: number; productName: string; quantity: number; unitPrice: number }>,
  };
}

export default router;
export { normalizeOrder };
