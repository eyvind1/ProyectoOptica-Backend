import {Router} from 'express';


//Obtengo las funciones del controlador
import {getAllMonturas, createNewMontura}  from '../controllers/monturas.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllMonturas',getAllMonturas);
router.post('/createNewMontura',createNewMontura);
export default router;