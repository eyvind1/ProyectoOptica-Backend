import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewVenta, getAllVentas,getAllVentasByDate,
    getAllVentasBySede,getAllVentasBySeller,unsubscribeVentasById} from '../controllers/ventas.controller.js';


const router = Router();

router.post('/createNewVenta',createNewVenta);
router.get('/getAllVentasBySede/:idsede',getAllVentasBySede);
router.get('/getAllVentasBySeller/:idvendedor',getAllVentasBySeller);
router.get('/getAllVentas',getAllVentas);
router.get('/getAllVentasByDate/:fechaIni/:fechaFin',getAllVentasByDate);
router.put('/unsubscribeVentasById/:idVenta',unsubscribeVentasById);
//router.get('/getAllVentasByDate',getAllVentasByDate);
export default router;
