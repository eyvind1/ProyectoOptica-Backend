import {Router} from 'express';
import passport from 'passport';


//Obtengo las funciones del controlador
import {createNewUser,getAllUsers,editUserById,darBajaUsuarioById} from '../controllers/users.controller.js';


const router = Router();


//Defino nombres de las rutas, 
router.post('/createNewUser',passport.authenticate('jwt',{session:false}),createNewUser);
router.get('/getAllUsers',passport.authenticate('jwt',{session:false}),getAllUsers);
router.put('/editUserById/:idUsuario/:idPersona',passport.authenticate('jwt',{session:false}),editUserById);
router.put('/darBajaUsuarioById/:idUsuario',passport.authenticate('jwt',{session:false}),darBajaUsuarioById);

export default router;