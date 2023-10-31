import { Router } from "express";
import passport from "passport";
import multer from "multer";

const upload = multer();

//Obtengo las funciones del controlador
import { uploadFile } from "../controllers/googleDriveApi.controller.js";

const router = Router();

//Defino nombres de las rutas,
router.post(
  "/uploadFile",
  upload.single("photo"),
  //   passport.authenticate("jwt", { session: false }),
  uploadFile
);

export default router;
