import {Router} from 'express';


import {getAllAccesorios,unsubscribeAccesoriosById,editAccesorioById, createNewAccesorio}  from '../controllers/accesorios.controller.js';


const router = Router();


router.get('/getAllAccesorios',getAllAccesorios);
router.post('/createNewAccesorio',createNewAccesorio);
router.put('/unsubscribeAccesoriosById/:idAccesorio',unsubscribeAccesoriosById);
router.put('/editAccesorioById/:idAccesorio',editAccesorioById);

export default router;