import {Router} from 'express';
import passport from 'passport';

//Obtengo las funciones del controlador
import {createNewIngreso,getAllEgresos,getAllIngresos} from '../controllers/caja.controller.js';

const router = Router();

router.post('/createNewIngreso', passport.authenticate('jwt',{session:false}),createNewIngreso);

router.get('/getAllIngresos',passport.authenticate('jwt',{session:false}),getAllIngresos);
router.get('/getAllEgresos',passport.authenticate('jwt',{session:false}),getAllEgresos);

export default router;