import {Router} from 'express';

//Obtengo las funciones del controlador
import {signIn,logOut} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signIn',signIn);
router.post('/logOut',logOut);

export default router;