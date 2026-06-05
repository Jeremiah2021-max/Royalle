import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import authRouter from "./auth";
import adminRouter from "./admin";
import contactRouter from "./contact";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use("/contact", contactRouter);

export default router;
