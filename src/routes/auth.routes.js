import {Router} from 'express';

//Obtengo las funciones del controlador
import {signIn} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signIn',signIn);

export default router;