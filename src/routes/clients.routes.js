import {Router} from 'express';

//Obtengo las funciones del controlador
import {getAllClients,getAllClientsById,createNewClient} from '../controllers/clients.controller.js';

const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllClients',getAllClients);
router.get('/getAllClientsById/:id',getAllClientsById);
router.post('/createNewClient',createNewClient);

export default router;