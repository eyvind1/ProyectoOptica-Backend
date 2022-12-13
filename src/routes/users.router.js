import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewUser, getAllUsers,editUserById,darBajaUsuarioById} from '../controllers/users.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.post('/createNewUser',createNewUser);
router.get('/getAllUsers',getAllUsers);
router.put('/editUserById/:idUsuario',editUserById);
router.put('/darBajaUsuarioById/:idUsuario',darBajaUsuarioById);

export default router;