import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env["GMAIL_USER"],
    pass: process.env["GMAIL_APP_PASSWORD"],
  },
});

export interface OrderEmailData {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city?: string | null;
  region?: string | null;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
}

function buildOrderTable(items: OrderEmailData["items"], total: number): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">GH₵${(i.unitPrice * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead>
        <tr style="background:#f5f0e8">
          <th style="padding:8px;text-align:left">Item</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px;font-weight:bold;text-align:right">Total</td>
          <td style="padding:10px;font-weight:bold;text-align:right;color:#b8860b">GH₵${Number(total).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>`;
}

export async function sendOrderConfirmationToCustomer(order: OrderEmailData) {
  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1810">
      <div style="background:#2c1810;padding:24px;text-align:center">
        <h1 style="color:#d4af37;margin:0;font-size:24px">Order Confirmed!</h1>
        <p style="color:#f5f0e8;margin:8px 0 0">Thank you for shopping with us, ${order.customerName}</p>
      </div>
      <div style="padding:24px;background:#fff">
        <p>Your order <strong>#${order.reference}</strong> has been received and is being processed.</p>
        <h3 style="color:#2c1810;border-bottom:2px solid #d4af37;padding-bottom:8px">Order Summary</h3>
        ${buildOrderTable(order.items, order.totalAmount)}
        <h3 style="color:#2c1810;margin-top:24px">Delivery Details</h3>
        <p style="margin:4px 0"><strong>Address:</strong> ${order.deliveryAddress}</p>
        ${order.city ? `<p style="margin:4px 0"><strong>City:</strong> ${order.city}</p>` : ""}
        ${order.region ? `<p style="margin:4px 0"><strong>Region:</strong> ${order.region}</p>` : ""}
        <p style="margin:4px 0"><strong>Phone:</strong> ${order.customerPhone}</p>
        <div style="background:#f5f0e8;border-left:4px solid #d4af37;padding:16px;margin-top:24px">
          <p style="margin:0">We will contact you shortly to confirm your delivery. For any questions, reply to this email.</p>
        </div>
      </div>
      <div style="background:#2c1810;padding:16px;text-align:center">
        <p style="color:#d4af37;margin:0;font-size:12px">Ghanaian Footwear & Traditional Wear — Step into Quality</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Ghana Shop" <${process.env["GMAIL_USER"]}>`,
    to: order.customerEmail,
    subject: `Order Confirmed — #${order.reference}`,
    html,
  });
  logger.info({ ref: order.reference }, "Customer confirmation email sent");
}

export async function sendOrderNotificationToAdmin(order: OrderEmailData) {
  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1810">
      <div style="background:#2c1810;padding:24px">
        <h1 style="color:#d4af37;margin:0;font-size:22px">New Order Received!</h1>
        <p style="color:#f5f0e8;margin:8px 0 0">Reference: <strong>${order.reference}</strong></p>
      </div>
      <div style="padding:24px;background:#fff">
        <h3 style="color:#2c1810">Customer Details</h3>
        <p style="margin:4px 0"><strong>Name:</strong> ${order.customerName}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${order.customerEmail}</p>
        <p style="margin:4px 0"><strong>Phone:</strong> ${order.customerPhone}</p>
        <h3 style="color:#2c1810;margin-top:16px">Delivery Address</h3>
        <p style="margin:4px 0">${order.deliveryAddress}${order.city ? ", " + order.city : ""}${order.region ? ", " + order.region : ""}</p>
        <h3 style="color:#2c1810;margin-top:16px">Order Items</h3>
        ${buildOrderTable(order.items, order.totalAmount)}
        <p style="margin-top:16px;color:#888;font-size:13px">Log in to the admin panel to update order status and delivery.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Ghana Shop" <${process.env["GMAIL_USER"]}>`,
    to: process.env["ADMIN_EMAIL"],
    subject: `New Order #${order.reference} — GH₵${Number(order.totalAmount).toFixed(2)}`,
    html,
  });
  logger.info({ ref: order.reference }, "Admin order notification email sent");
}

export async function sendOrderStatusUpdateToCustomer(
  email: string,
  name: string,
  reference: string,
  newStatus: string
) {
  const statusMessages: Record<string, string> = {
    processing: "Your order is now being processed and will be dispatched soon.",
    shipped: "Great news! Your order has been shipped and is on its way to you.",
    delivered: "Your order has been delivered. We hope you love your purchase!",
    cancelled: "Your order has been cancelled. Please contact us if you have questions.",
  };

  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1810">
      <div style="background:#2c1810;padding:24px">
        <h1 style="color:#d4af37;margin:0;font-size:22px">Order Update</h1>
      </div>
      <div style="padding:24px;background:#fff">
        <p>Hello ${name},</p>
        <p>Your order <strong>#${reference}</strong> status has been updated to: <strong style="color:#b8860b;text-transform:uppercase">${newStatus}</strong></p>
        <p>${statusMessages[newStatus] ?? "Your order has been updated."}</p>
      </div>
      <div style="background:#2c1810;padding:16px;text-align:center">
        <p style="color:#d4af37;margin:0;font-size:12px">Ghanaian Footwear & Traditional Wear</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Napong Ahenema King" <${process.env["GMAIL_USER"]}>`,
    to: email,
    subject: `Order #${reference} — Status: ${newStatus}`,
    html,
  });
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const html = `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1810">
      <div style="background:#2c1810;padding:24px">
        <h1 style="color:#d4af37;margin:0;font-size:22px">New Contact Message</h1>
        <p style="color:#d4af37;margin:8px 0 0;font-size:13px">Napong Ahenema King</p>
      </div>
      <div style="padding:24px;background:#fff">
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:8px 0;color:#888;font-size:13px;width:100px">From</td><td style="padding:8px 0;font-weight:bold">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#888;font-size:13px">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#b8860b">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#888;font-size:13px">Phone</td><td style="padding:8px 0">${data.phone}</td></tr>` : ""}
        </table>
        <div style="background:#fdf8f0;border-left:3px solid #d4af37;padding:16px;border-radius:4px">
          <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap">${data.message}</p>
        </div>
        <p style="margin-top:20px;font-size:12px;color:#999">Reply directly to this email to respond to ${data.name}.</p>
      </div>
      <div style="background:#2c1810;padding:16px;text-align:center">
        <p style="color:#d4af37;margin:0;font-size:12px">Napong Ahenema King — Ghanaian Footwear &amp; Traditional Wear</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Napong Ahenema King" <${process.env["GMAIL_USER"]}>`,
    to: process.env["ADMIN_EMAIL"] ?? process.env["GMAIL_USER"]!,
    replyTo: data.email,
    subject: `New message from ${data.name}`,
    html,
  });
}
