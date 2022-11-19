import {Router} from 'express';


//Obtengo las funciones del controlador
import {getAllSedes, createNewSede}  from '../controllers/sedes.controller.js';

const router = Router();


router.get('/getAllSedes',getAllSedes);
router.post('/createNewSede',createNewSede);
export default router;