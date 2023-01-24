import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {getProductBySede,updateListOfProducts,createListOfProducts}  from '../controllers/productos.controller.js';

const router = Router();


router.get('/getProductBySede/:idSede/:productName',passport.authenticate('jwt',{session:false}),getProductBySede);
router.put('/updateListOfProducts',passport.authenticate('jwt',{session:false}),updateListOfProducts);   
router.post('/createListOfProducts',createListOfProducts);   


export default router;