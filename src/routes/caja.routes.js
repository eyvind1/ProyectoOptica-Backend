import {Router} from 'express';
import passport from 'passport';

//Obtengo las funciones del controlador
import {createNewIngreso,getAllIngresosByDate,getAllEgresosByDate,unsubscribeEgresoById,getAllEgresos,getAllIngresos,getAllCajaPerMonths} from '../controllers/caja.controller.js';

const router = Router();

router.post('/createNewIngreso', passport.authenticate('jwt',{session:false}),createNewIngreso);
router.put('/unsubscribeEgresoById/:idCaja', passport.authenticate('jwt',{session:false}),unsubscribeEgresoById);
router.get('/getAllEgresosByDate/:fechaIni/:fechaFin/:idSede',passport.authenticate('jwt',{session:false}),getAllEgresosByDate);
router.get('/getAllIngresosByDate/:fechaIni/:fechaFin/:idSede',passport.authenticate('jwt',{session:false}),getAllIngresosByDate);
router.get('/getAllIngresos',passport.authenticate('jwt',{session:false}),getAllIngresos);
router.get('/getAllEgresos',passport.authenticate('jwt',{session:false}),getAllEgresos);
router.get('/getAllCajaPerMonths/:fechaIni/:fechaFin/:idSede',passport.authenticate('jwt',{session:false}),getAllCajaPerMonths);

export default router;  