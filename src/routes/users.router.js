import {Router} from 'express';


//Obtengo las funciones del controlador
import {createNewUser} from '../controllers/users.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.post('/createNewUser',createNewUser);

export default router;