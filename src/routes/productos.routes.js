import {Router} from 'express';


//Obtengo las funciones del controlador
import {getProductBySede}  from '../controllers/productos.controller.js';

const router = Router();


router.get('/getProductBySede/:idSede/:productName',getProductBySede);



export default router;