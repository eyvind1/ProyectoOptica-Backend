import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {getAllSedes, editSedeById,createNewSede,unsubscribeSedeById}  from '../controllers/sedes.controller.js';

const router = Router();


router.get('/getAllSedes',getAllSedes);
router.post('/createNewSede',passport.authenticate('jwt',{session:false}),createNewSede);
router.put('/editSedeById/:idSede',passport.authenticate('jwt',{session:false}),editSedeById);
router.put('/unsubscribeSedeById/:idSede',passport.authenticate('jwt',{session:false}),unsubscribeSedeById);

export default router;