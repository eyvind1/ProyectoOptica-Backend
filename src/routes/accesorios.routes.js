import {Router} from 'express';


import {getAllAccesorios, createNewAccesorio}  from '../controllers/accesorios.controller.js';


const router = Router();


router.get('/getAllAccesorios',getAllAccesorios);
router.post('/createNewAccesorio',createNewAccesorio);
router.put('/unsubscribeAccesoriosById/:idAccesorio',unsubscribeAccesoriosById);
export default router;