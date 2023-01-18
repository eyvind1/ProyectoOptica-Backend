import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {createNewVenta, getAllVentas,getAllVentasByDate,
    getAllVentasBySede,getAllVentasBySeller,unsubscribeVentasById} from '../controllers/ventas.controller.js';


const router = Router();

router.post('/createNewVenta',passport.authenticate('jwt',{session:false}),createNewVenta);
router.get('/getAllVentasBySede/:idsede',passport.authenticate('jwt',{session:false}),getAllVentasBySede);
router.get('/getAllVentasBySeller/:idvendedor',passport.authenticate('jwt',{session:false}),getAllVentasBySeller);
router.get('/getAllVentas',passport.authenticate('jwt',{session:false}),getAllVentas);
router.get('/getAllVentasByDate/:fechaIni/:fechaFin',passport.authenticate('jwt',{session:false}),getAllVentasByDate);
router.put('/unsubscribeVentasById/:idVenta',passport.authenticate('jwt',{session:false}),unsubscribeVentasById);
//router.get('/getAllVentasByDate',getAllVentasByDate);
export default router;
