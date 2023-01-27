import {Router} from 'express';

import passport from 'passport';

import {getAllLunas, getAllLunasForVenta,unsubscribeLunasById,editLunaById,createNewLuna}  from '../controllers/lunas.controller.js';


const router = Router();


router.get('/getAllLunas',passport.authenticate('jwt',{session:false}),getAllLunas);
router.get('/getAllLunasBySede',passport.authenticate('jwt',{session:false}),getAllLunasForVenta);
router.get('/getAllLunasForVenta',passport.authenticate('jwt',{session:false}),getAllLunasForVenta);
router.post('/createNewLuna',passport.authenticate('jwt',{session:false}),createNewLuna);
router.put('/editLunaById/:idLuna',passport.authenticate('jwt',{session:false}),editLunaById );
router.put('/unsubscribeLunasById/:idLuna', passport.authenticate('jwt',{session:false}),unsubscribeLunasById);

export default router;