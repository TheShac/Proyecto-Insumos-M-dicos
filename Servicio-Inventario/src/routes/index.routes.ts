import { Router } from "express";
import { consultarStock } from "../modules/inventario/inventario.service";

export const router = Router();
router.get("/health", (_req, res) => res.json({ status: "ok", servicio: "inventario" }));

router.get("/inventario/stock", async (_req, res, next) => {
  try {
    res.json(await consultarStock());
  } catch (err) {
    next(err);
  }
});
