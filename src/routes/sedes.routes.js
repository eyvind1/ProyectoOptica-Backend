import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {getAllSedes, createNewSede,unsubscribeSedeById}  from '../controllers/sedes.controller.js';

const router = Router();


router.get('/getAllSedes',passport.authenticate('jwt',{session:false}),getAllSedes);
router.post('/createNewSede',passport.authenticate('jwt',{session:false}),createNewSede);
router.put('/unsubscribeSedeById/:idSede',unsubscribeSedeById);

export default router;