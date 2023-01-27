import {Router} from 'express';
import passport from 'passport';
//Obtengo las funciones del controlador
import {getAllMonturas, editMonturaById,createNewMontura,
        getAllMonturasBySede,unsubscribeMonturasById, getAllMonturasForVenta}  from '../controllers/monturas.controller.js';

const router = Router();


/* Defino y protejo las rutas */ 
router.get('/getAllMonturas',passport.authenticate('jwt',{session:false}), getAllMonturas);
router.get('/getAllMonturasForVenta',passport.authenticate('jwt',{session:false}), getAllMonturasForVenta);
router.post('/createNewMontura',passport.authenticate('jwt',{session:false}),createNewMontura);
router.put('/unsubscribeMonturasById/:idMontura',passport.authenticate('jwt',{session:false}), unsubscribeMonturasById);
router.put('/editMonturaById/:idMontura',passport.authenticate('jwt',{session:false}),editMonturaById);

router.get('/getAllMonturasBySede/:idSede',passport.authenticate('jwt',{session:false}),getAllMonturasBySede);




export default router;


//Tutorial 


// https://www.youtube.com/watch?v=NN-Jt6EjFAc