import { Passport } from "passport";
import {Strategy as LocalStrategy} from 'passport-local';


    passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    //Verifico si existe en la base de datos el usuario
    /*if(!user){
        return done(null,false,{message:'Usuario no Existe'})
    }
    else{

    }*/

}))