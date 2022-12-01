import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewVenta, getAllVentasBySede,getAllVentasBySeller} from '../controllers/ventas.controller.js';


const router = Router();

router.post('/createNewVenta',createNewVenta);
router.get('/getAllVentasBySede/:idsede',getAllVentasBySede);
router.get('/getAllVentasBySeller/:idvendedor',getAllVentasBySeller);

export default router;