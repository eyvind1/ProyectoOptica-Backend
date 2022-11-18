import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewUser, getAllUsers} from '../controllers/users.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.post('/createNewUser',createNewUser);
router.get('/getAllUsers',getAllUsers);

export default router;