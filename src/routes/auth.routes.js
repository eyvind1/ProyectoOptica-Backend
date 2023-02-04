import {Router} from 'express';

//Obtengo las funciones del controlador
import {signIn,editContraseniaUserById} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signIn',signIn);
router.post('/editContraseniaUserById ',editContraseniaUserById );

export default router;