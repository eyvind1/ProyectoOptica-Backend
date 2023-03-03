

//Estrategia para poder autenticar
import {Strategy,ExtractJwt} from 'passport-jwt';


const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secretkey'
}

export const JwtStrategy = new Strategy(options,(payload,done)=>{
    return done(null,payload);
});