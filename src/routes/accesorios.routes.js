import {Router} from 'express';
import passport from 'passport';
import {getAllAccesorios,getAllAccesoriosForVenta,unsubscribeAccesoriosById,editAccesorioById, createNewAccesorio}  from '../controllers/accesorios.controller.js';


const router = Router();


router.get('/getAllAccesorios',passport.authenticate('jwt',{session:false}),getAllAccesorios);
router.get('/getAllAccesoriosForVenta/:idSede',passport.authenticate('jwt',{session:false}),getAllAccesoriosForVenta);
router.post('/createNewAccesorio',createNewAccesorio);
router.put('/unsubscribeAccesoriosById/:idAccesorio',passport.authenticate('jwt',{session:false}),unsubscribeAccesoriosById);
router.put('/editAccesorioById/:idAccesorio',passport.authenticate('jwt',{session:false}),editAccesorioById);

export default router;