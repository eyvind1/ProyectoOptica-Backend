import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {getProductBySede,updateListOfProducts,createListOfProducts,updateSedeOfProducts}  from '../controllers/productos.controller.js';

const router = Router();


router.get('/getProductBySede/:idSede/:productName',passport.authenticate('jwt',{session:false}),getProductBySede);
router.put('/updateListOfProducts',passport.authenticate('jwt',{session:false}),updateListOfProducts);   
router.post('/createListOfProducts',passport.authenticate('jwt',{session:false}),createListOfProducts);   
router.put('/updateSedeOfProducts',passport.authenticate('jwt',{session:false}),updateSedeOfProducts);   

export default router;