import {Router} from 'express';


//Obtengo las funciones del controlador
import {getProductBySede,updateListOfProducts,createListOfProducts}  from '../controllers/productos.controller.js';

const router = Router();


router.get('/getProductBySede/:idSede/:productName',getProductBySede);
router.put('/updateListOfProducts',updateListOfProducts);   
router.post('/createListOfProducts',createListOfProducts);   


export default router;