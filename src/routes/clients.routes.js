import {Router} from 'express';

//Obtengo las funciones del controlador
import {getAllClients,getAllClientsById,createNewClient,getAllClientsMinified} from '../controllers/clients.controller.js';

const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllClients',getAllClients);
router.get('/getAllClientsById/:id',getAllClientsById);
router.post('/createNewClient',createNewClient);
router.get('/getAllClientsMinified',getAllClientsMinified);
router.put('/editClientById/:idCliente/:idPersona',editClientById);

export default router;