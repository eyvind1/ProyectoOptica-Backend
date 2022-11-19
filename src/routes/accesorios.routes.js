import {Router} from 'express';


import {getAllAccesorios, createNewAccesorio}  from '../controllers/accesorios.controller.js';


const router = Router();


router.get('/getAllAccesorios',getAllAccesorios);
router.post('/createNewAccesorio',createNewAccesorio);

export default router;