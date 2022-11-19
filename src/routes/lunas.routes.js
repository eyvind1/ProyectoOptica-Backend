import {Router} from 'express';


import {getAllLunas, createNewLuna}  from '../controllers/lunas.controller.js';


const router = Router();


router.get('/getAllLunas',getAllLunas);
router.post('/createNewLuna',createNewLuna);

export default router;