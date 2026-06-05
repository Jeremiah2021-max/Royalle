import { Router } from "express";
import { sendContactEmail } from "../lib/email";
import { logger } from "../lib/logger";

const router = Router();

router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Name, email, and message are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  sendContactEmail({ name: name.trim(), email: email.trim(), phone: phone?.trim(), message: message.trim() }).catch(
    (err) => logger.error({ err }, "Failed to send contact email")
  );

  res.json({ success: true });
});

export default router;
