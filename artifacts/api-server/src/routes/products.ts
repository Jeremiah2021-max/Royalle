import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
  res.json(products.map(normalizeProduct));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(normalizeProduct(product));
});

function normalizeProduct(p: typeof productsTable.$inferSelect) {
  return {
    ...p,
    price: Number(p.price),
  };
}

export default router;
