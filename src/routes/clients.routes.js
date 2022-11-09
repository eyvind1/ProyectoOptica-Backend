import {Router} from 'express';

//Obtengo las funciones del controlador
import {getAllClients,getAllClientsById} from '../controllers/clientes.controller.js';

const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllClients',getAllClients);
router.get('/getAllClientsById/:id',getAllClientsById);

export default router;