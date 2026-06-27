import { Router } from "express";
import * as ctrl from "../modules/pedidos/pedidos.controller";
import { validate } from "../middlewares/validate.middleware";
import { crearPedidoSchema } from "../modules/pedidos/pedidos.contracts";

export const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));

router.post("/pedidos", validate(crearPedidoSchema), ctrl.crearPedido);
router.get("/pedidos", ctrl.listarPedidos);
router.get("/pedidos/:id", ctrl.obtenerPedido);
router.get("/pedidos/stream/estados", ctrl.streamEstados);