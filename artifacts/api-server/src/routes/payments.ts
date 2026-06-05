import { Router } from "express";
import axios from "axios";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();
const PAYSTACK_SECRET = process.env["PAYSTACK_SECRET_KEY"]!;
const PAYSTACK_BASE = "https://api.paystack.co";

router.post("/initialize", async (req, res) => {
  const { email, amount, orderId, reference } = req.body as {
    email: string;
    amount: number;
    orderId: number;
    reference?: string;
  };

  try {
    const payload: Record<string, unknown> = {
      email,
      amount: Math.round(amount * 100), // Paystack uses pesewas
      currency: "GHS",
      callback_url: `${process.env["REPLIT_DOMAINS"]?.split(",")[0] ? "https://" + process.env["REPLIT_DOMAINS"]?.split(",")[0] : ""}/payment/callback`,
      metadata: { orderId },
    };
    if (reference) payload["reference"] = reference;

    const { data } = await axios.post(`${PAYSTACK_BASE}/transaction/initialize`, payload, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    res.json({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });
  } catch (err) {
    logger.error({ err }, "Paystack initialize failed");
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params as { reference: string };
  try {
    const { data } = await axios.get(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const txn = data.data;
    const status = txn.status === "success" ? "paid" : "failed";

    // Update order payment status
    await db
      .update(ordersTable)
      .set({
        paymentStatus: status,
        orderStatus: status === "paid" ? "processing" : "pending",
      })
      .where(eq(ordersTable.reference, reference));

    res.json({
      status: txn.status,
      reference: txn.reference,
      amount: txn.amount / 100,
      customerEmail: txn.customer?.email,
    });
  } catch (err) {
    logger.error({ err }, "Paystack verify failed");
    res.status(500).json({ error: "Payment verification failed" });
  }
});

export default router;
