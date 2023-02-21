import {Router} from 'express';
import passport from 'passport';

//Obtengo las funciones del controlador
import {getAllClients,editClientById,getClientById,createNewClient,
        darBajaClienteById,getAllClientsMinified,getAllClientsBySedeMinified} from '../controllers/clients.controller.js';

const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllClients',getAllClients);
//router.get('/getAllClientsById/:id',passport.authenticate('jwt',{session:false}),getAllClientsById);
router.get('/getClientById/:idCliente',getClientById);
router.post('/createNewClient',passport.authenticate('jwt',{session:false}),createNewClient);
router.get('/getAllClientsBySedeMinified/:idSede',passport.authenticate('jwt',{session:false}),getAllClientsBySedeMinified);
router.get('/getAllClientsMinified',passport.authenticate('jwt',{session:false}),getAllClientsMinified);
router.put('/editClientById/:idCliente',passport.authenticate('jwt',{session:false}),editClientById);
router.put('/darBajaClienteById/:idCliente',passport.authenticate('jwt',{session:false}),darBajaClienteById);

export default router;