import {Router} from 'express';

//Obtengo las funciones del controlador
import {getAllClients,editClientById,
        getAllClientsById,createNewClient,
        darBajaClienteById,getAllClientsMinified} from '../controllers/clients.controller.js';

const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllClients',getAllClients);
router.get('/getAllClientsById/:id',getAllClientsById);
router.post('/createNewClient',createNewClient);
router.get('/getAllClientsMinified',getAllClientsMinified);
router.put('/editClientById/:idCliente/:idPersona',editClientById);
router.put('/darBajaClienteById/:idCliente',darBajaClienteById);

export default router;