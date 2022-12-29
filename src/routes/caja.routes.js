import {Router} from 'express';

//Obtengo las funciones del controlador
import {createNewIngreso,getAllEgresos,getAllIngresos} from '../controllers/caja.controller.js';

const router = Router();

router.post('/createNewIngreso',createNewIngreso);

router.get('/getAllIngresos',getAllIngresos);
router.get('/getAllEgresos',getAllEgresos);

export default router;