/* En este file se definen las funciones relacionadas a  
    1.- Autenticacion del usuario
*/
import AWS from '../db.js';
//import passport from 'passport';  
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient        = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_USUARIO  = "Usuarios";

async function desencriptarPassword(contraseniabd,contrasenia){
    return await bcrypt.compare(contrasenia,contraseniabd);
}

async function findUserByEmail(usuario){
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
                //let union = {...user.Items[0],...result};
                user.Items[0].nombres = result.Items[0].nombres;
                user.Items[0].apellidos = result.Items[0].apellidos;
                user.Items[0].email = result.Items[0].email;
                //Agrego atributos de la persona al json usuario
                return user;
    
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
    //Valido usuario y contrasenia
    const user       = await findUserByEmail(email);
    console.log('user ' ,user)
    if (user.Items.length ===0) {
        return res.status(401).send('El usuario no existe');
    }
    //Si paso el filtro del email, recien verifico el password porque usare los datos que retorna la BD
    console.log(user.Items[0].contrasenia,' ',password)
    const validarPassword  = await desencriptarPassword(user.Items[0].contrasenia,password);
    if(validarPassword===false){
        return res.status(401).send('La contraseña no coincide');
    }
    const token        = jwt.sign({_id: user.Items[0].id_usuario}, 'secretkey',{expiresIn:'3h'});
    const onlyDataUser = user.Items[0]; 
    return res.status(200).json({token,onlyDataUser});
};

