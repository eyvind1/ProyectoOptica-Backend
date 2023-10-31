import { Router } from "express";
import passport from "passport";

//Obtengo las funciones del controlador
import { uploadFile } from "../controllers/googleDriveApi.controller.js";

const router = Router();

//Defino nombres de las rutas,
router.post(
  "/uploadFile",
  //   passport.authenticate("jwt", { session: false }),
  uploadFile
);

export default router;
