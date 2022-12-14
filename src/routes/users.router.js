import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewUser,validateUser, getAllUsers,editUserById,darBajaUsuarioById} from '../controllers/users.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.post('/createNewUser',createNewUser);
router.get('/getAllUsers',getAllUsers);
router.get('/validateUser/:idUsuario',validateUser);
router.put('/editUserById/:idUsuario/:idPersona',editUserById);
router.put('/darBajaUsuarioById/:idUsuario',darBajaUsuarioById);

export default router;