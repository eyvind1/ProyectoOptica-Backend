import {Router} from 'express';


//Obtengo las funciones del controlador
import {getProductBySede,updateListOfProducts}  from '../controllers/productos.controller.js';

const router = Router();


router.get('/getProductBySede/:idSede/:productName',getProductBySede);
router.put('/updateListOfProducts',updateListOfProducts);




export default router;