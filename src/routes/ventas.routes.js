import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {createNewVenta, getAllVentas,getAllVentasByDate,updatePagoCuotasVentaById,
    getAllVentasBySede,getAllVentasBySeller,unsubscribeVentasById} from '../controllers/ventas.controller.js';


const router = Router();

router.post('/createNewVenta',createNewVenta);
router.put('/updatePagoCuotasVentaById/:idVenta',updatePagoCuotasVentaById);
router.get('/getAllVentasBySede/:idsede',passport.authenticate('jwt',{session:false}),getAllVentasBySede);
router.get('/getAllVentasBySeller/:idvendedor',passport.authenticate('jwt',{session:false}),getAllVentasBySeller);
router.get('/getAllVentas',getAllVentas);
router.get('/getAllVentasByDate/:fechaIni/:fechaFin/:idSede',getAllVentasByDate);
router.put('/unsubscribeVentasById/:idVenta',unsubscribeVentasById);
//router.get('/getAllVentasByDate',getAllVentasByDate);
export default router;
