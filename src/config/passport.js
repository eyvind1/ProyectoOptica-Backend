import passport from "passport";

//Estrategia para poder autenticar
import {Strategy as LocalStrategy} from 'passport-local';


    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        console.log('Email: pass: ',email,password);
        //Verifico si existe en la base de datos el usuario
        /*if(!user){
            return done(null,false,{message:'Usuario no Existe'})
        }
        else{
            
        }*/

}))