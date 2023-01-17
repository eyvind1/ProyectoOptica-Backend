/* En este file se definen las funciones relacionadas a
  
1.- Autenticacion del usuario
*/
import AWS from '../db.js';
import {v4} from 'uuid';
//import passport from 'passport';  
import jwt from 'jsonwebtoken';

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient        = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_USUARIO  = "Usuarios";




//export const responseSignIn = (req, res) => res.send("login OK");

/* Por el momento solo valido el email  OJO  ************* */ 
/* Validamos que el usuario este habilitado */ 
async function findUserByEmail(usuario,contrasenia){
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            FilterExpression:
              'usuario = :usuario and habilitado = :estado',
            ExpressionAttributeValues: {
                ":usuario": usuario,
                ":estado" : true,
            }
        };
        const user  = await dynamoClient.scan(paramsUsuario).promise();  
        console.log(user);
        
        //En este caso utilizamos scan y sino encuentran no retorna error simplemente retora un vacio por eso valido
        if(user.Items.length>0){
            try {
                const paramsPersona = {
                    TableName: 'Persona',
                    FilterExpression:
                      'id_persona = :id_persona' ,
                    ExpressionAttributeValues: {
                        ":id_persona": user.Items[0].id_persona
                    }
                };
                let result= await dynamoClient.scan(paramsPersona).promise();      
                user.Items[0].nombres = result.Items[0].nombres;
                user.Items[0].apellidos = result.Items[0].apellidos;
                //Agrego atributos de la persona al json usuario
                return user.Items;
    
            } catch (error) {
                console.log(error);
                return error;
            }
        }
        //En otro caso retorno un array vacio
        return user;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const signIn = async (req, res) => {
    const { email, password } = req.body;
    const user = await findUserByEmail(email,password);
    //Si existe un usuario
    if (user.length> 0) {
        const token = jwt.sign({_id: user[0].id_usuario}, 'secretkey',{expiresIn:'120s'});
        return res.status(200).json({token,user});
    }
    else{
        return res.status(401).send('The email doen\' exists');
    }
};

export const logOut = async (req, res, next) => {
    await req.logout((err) => {
        console.log(err)
        if (err) return next(err);
        req.flash("success_msg", "You are logged out now.");
        //res.redirect("/signIn");
        res.send('se borro la session')
        console.log('segundo',req.session.id)

    });
  };
  

