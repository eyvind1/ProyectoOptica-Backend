import {Router} from 'express';
import passport from 'passport';
import {cr,getAllAccesorios,getAllAccesoriosForVenta,unsubscribeAccesoriosById,editAccesorioById, createNewAccesorio}  from '../controllers/accesorios.controller.js';


const router = Router();


router.get('/getAllAccesorios',passport.authenticate('jwt',{session:false}),getAllAccesorios);
router.get('/cr',cr);

router.get('/getAllAccesoriosForVenta/:idSede',passport.authenticate('jwt',{session:false}),getAllAccesoriosForVenta);
router.post('/createNewAccesorio',passport.authenticate('jwt',{session:false}),createNewAccesorio);
router.put('/unsubscribeAccesoriosById/:idAccesorio',passport.authenticate('jwt',{session:false}),unsubscribeAccesoriosById);
router.put('/editAccesorioById/:idAccesorio',passport.authenticate('jwt',{session:false}),editAccesorioById);

export default router;