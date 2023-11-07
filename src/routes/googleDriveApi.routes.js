import { Router } from "express";
import passport from "passport";
import multer from "multer";

const upload = multer();

//Obtengo las funciones del controlador
import {
  uploadFile,
  prueba,
} from "../controllers/googleDriveApi.controller.js";

const router = Router();

router.post(
  "/uploadFile",
  upload.single("photo"),
  // passport.authenticate("jwt", { session: false }),
  uploadFile
);

router.post(
  "/nel",
  prueba
  // passport.authenticate("jwt", { session: false }),
);

export default router;
