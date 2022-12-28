import {Router} from 'express';

//Obtengo las funciones del controlador
import {createNewIngreso} from '../controllers/caja.controller.js';

const router = Router();


router.get('/createNewIngreso',createNewIngreso);

export default router;