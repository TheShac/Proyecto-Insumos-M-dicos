import { Router } from "express";
import { listarCuentas } from "../modules/contabilidad/contabilidad.service";

export const router = Router();
router.get("/health", (_req, res) => res.json({ status: "ok", servicio: "contabilidad" }));

router.get("/contabilidad/cuentas", async (_req, res, next) => {
  try {
    res.json(await listarCuentas());
  } catch (err) {
    next(err);
  }
});
