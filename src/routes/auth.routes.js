import {Router} from 'express';

//Obtengo las funciones del controlador
import {signIn,logOut,responseSignIn} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signIn',signIn);
router.post('/logOut',logOut);
router.get('/responseSignIn',responseSignIn);

export default router;