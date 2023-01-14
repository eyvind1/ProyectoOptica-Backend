
import passport from "passport";
import AWS from '../db.js'

//Estrategia para poder autenticar
import {Strategy as LocalStrategy} from 'passport-local';

// Variables necesarias para consultar a la base de datos
const TABLE_NAME_USUARIOS  = "Usuarios";
const dynamoClient         = new AWS.DynamoDB.DocumentClient();

/* Por el momento solo valido el email  OJO  ************* */ 
async function findUserByEmail(usuario,contrasenia){
        const dynamoClient = new AWS.DynamoDB.DocumentClient();
        try {
            const paramsUsuario = {
                TableName: TABLE_NAME_USUARIOS,
                FilterExpression:
                  'usuario = :usuario',
                ExpressionAttributeValues: {
                    ":usuario": usuario
                }
            };
            const user  = await dynamoClient.scan(paramsUsuario).promise();      
            return user.Items;
        } catch (error) {
            console.log(error);
            return error;
        }
}
/* Por el momento solo valido el email  OJO  ************* */ 
async function findUserById(id_usuario){
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIOS,
            FilterExpression:
              'id_usuario = :id_usuario',
            ExpressionAttributeValues: {
                ":id_usuario": id_usuario
            }
        };
        const user  = await dynamoClient.scan(paramsUsuario).promise();      
        return user.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async(email, password, done) => {
        console.log('Email: pass: ',email,password);
        const user = await findUserByEmail(email,password);
        if (user.length > 0) {
            console.log('if ', user)
            return done(null, user);
          }
          else{
            console.log('entro al no user')
            return done(null, false, { message: "No existe el usuario" });

          }

        //Verifico si existe en la base de datos el usuario
        
    }))
    
    /* Serializar significa que guardo la sesion del usuario en este caso utilizo
        Express-Session 
    */
    passport.serializeUser((user, done) => {
        console.log('entro a serializar',user[0].id_usuario)
        done(null, user[0].id_usuario);
      });
      
    passport.deserializeUser(async(id, done) => {
        /*User.findById(id, (err, user) => {
          done(err, user);
        });*/
        const user = await findUserById(id);
        if(user){
            console.log('cuando entra a desra **************',id)
            done(null, user[0].id_usuario);    
        }
 
      });
