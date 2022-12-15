import {Router} from 'express';


import {getAllLunas, editLunaById,createNewLuna}  from '../controllers/lunas.controller.js';


const router = Router();


router.get('/getAllLunas',getAllLunas);
router.post('/createNewLuna',createNewLuna);
router.put('/editLunaById/:idLuna',editLunaById );

export default router;