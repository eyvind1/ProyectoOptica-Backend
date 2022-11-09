import {Router} from 'express';

//Obtengo las funciones del controlador
import {getAllClients} from '../controllers/clientes.controller.js';

const router = Router();


//Defino las rutas, 
router.get('/getAllClients',getAllClients);

export default router;