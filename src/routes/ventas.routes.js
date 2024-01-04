import { Router } from "express";
import passport from "passport";

//Obtengo las funciones del controlador
import {
  createNewVenta,
  getAllVentas,
  getAllVentasByDate,
  updatePagoCuotasVentaById,
  getAllVentasBySede,
  getAllVentasBySeller,
  unsubscribeVentasById,
  getAllVentasEliminadasBySede,
  getPDF,
} from "../controllers/ventas.controller.js";

const router = Router();

router.post(
  "/createNewVenta",
  passport.authenticate("jwt", { session: false }),
  createNewVenta
);
router.put(
  "/updatePagoCuotasVentaById/:idVenta",
  passport.authenticate("jwt", { session: false }),
  updatePagoCuotasVentaById
);
router.get(
  "/getAllVentasBySede/:idsede",
  passport.authenticate("jwt", { session: false }),
  getAllVentasBySede
);
router.get(
  "/getAllVentasBySeller/:idvendedor",
  passport.authenticate("jwt", { session: false }),
  getAllVentasBySeller
);
router.get(
  "/getAllVentasEliminadasBySede/:idsede",
  passport.authenticate("jwt", { session: false }),
  getAllVentasEliminadasBySede
);
router.get(
  "/getAllVentas",
  passport.authenticate("jwt", { session: false }),
  getAllVentas
);
router.get(
  "/getAllVentasByDate/:fechaIni/:fechaFin/:idSede",
  passport.authenticate("jwt", { session: false }),
  getAllVentasByDate
);
router.put(
  "/unsubscribeVentasById/:idVenta",
  passport.authenticate("jwt", { session: false }),
  unsubscribeVentasById
);
router.post(
  "/getPDF",
  passport.authenticate("jwt", { session: false }),
  getPDF
);

export default router;
