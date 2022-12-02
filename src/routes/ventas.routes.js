import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewVenta, getAllVentas,getAllVentasBySede,getAllVentasBySeller} from '../controllers/ventas.controller.js';


const router = Router();

router.post('/createNewVenta',createNewVenta);
router.get('/getAllVentasBySede/:idsede',getAllVentasBySede);
router.get('/getAllVentasBySeller/:idvendedor',getAllVentasBySeller);
router.get('/getAllVentas',getAllVentas);

export default router;