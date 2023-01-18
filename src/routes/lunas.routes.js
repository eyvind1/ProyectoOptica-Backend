import {Router} from 'express';

import passport from 'passport';

import {getAllLunas, unsubscribeLunasById,editLunaById,createNewLuna}  from '../controllers/lunas.controller.js';


const router = Router();


router.get('/getAllLunas',passport.authenticate('jwt',{session:false}),getAllLunas);
router.post('/createNewLuna',passport.authenticate('jwt',{session:false}),createNewLuna);
router.put('/editLunaById/:idLuna',passport.authenticate('jwt',{session:false}),editLunaById );
router.put('/unsubscribeLunasById/:idLuna', passport.authenticate('jwt',{session:false}),unsubscribeLunasById);

export default router;