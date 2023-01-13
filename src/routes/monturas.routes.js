import {Router} from 'express';

import  isAuthenticated from '../helpers/auth.js'
//Obtengo las funciones del controlador
import {getAllMonturas, editMonturaById,createNewMontura,unsubscribeMonturasById}  from '../controllers/monturas.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.get('/getAllMonturas',getAllMonturas);
router.post('/createNewMontura',createNewMontura);
router.put('/unsubscribeMonturasById/:idMontura',unsubscribeMonturasById);
router.put('/editMonturaById/:idMontura',editMonturaById);



export default router;


//Tutorial 


// https://www.youtube.com/watch?v=NN-Jt6EjFAc