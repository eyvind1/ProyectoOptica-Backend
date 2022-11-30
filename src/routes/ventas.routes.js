import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewVenta} from '../controllers/ventas.controller.js';


const router = Router();


router.post('/createNewVenta',createNewVenta);
//router.get('/getAllUsers',getAllUsers);

export default router;