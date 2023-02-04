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

/* Funcion especifica para encriptar una contrasenia con Bcrypt*/
async function encriptarPassword(contrasenia){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasenia,salt);
}

export const editContraseniaUserById = async (req, res) => {

    const { email, password, newPassword } = req.body;
    
    //Valido usuario y contrasenia
    const user       = await findUserByEmail(email);
    if (user.Items.length ===0) {
        return res.status(401).send('El usuario no existe');
    }
    //Si paso el filtro del email, recien verifico el password porque usare los datos que retorna la BD
    const validarPassword  = await desencriptarPassword(user.Items[0].contrasenia,password);
    if(validarPassword===false){
        return res.status(401).send('La contraseña no coincide');
    }
    //Si paso ambos filtros de contrasenia y usuario, recien actualizo su contrasenia

    ////////////////////////
  
    try {
        let contraseniaEncriptada = await encriptarPassword(newPassword);
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            Key: {
                "id_usuario":user.Items[0].id_usuario,
            },
            UpdateExpression: `SET contrasenia = :contrasenia`,
            ExpressionAttributeValues: {
                ":contrasenia": contraseniaEncriptada,
            }
        };
        const usuario = await dynamoClient.update(paramsUsuario).promise();
        return res.json(usuario.Items);
    } catch (error) {
        return res.status(500).json({
            message:'No se pudo actualizar la contrasenia '
        })
    }
};

async function findUserByEmail(usuario){
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
    if (user.Items.length ===0) {
        return res.status(401).send('El usuario no existe');
    }
    //Si paso el filtro del email, recien verifico el password porque usare los datos que retorna la BD
    const validarPassword  = await desencriptarPassword(user.Items[0].contrasenia,password);
    if(validarPassword===false){
        return res.status(401).send('La contraseña no coincide');
    }
    const token        = jwt.sign({_id: user.Items[0].id_usuario}, 'secretkey',{expiresIn:'3h'});
    const onlyDataUser = user.Items[0]; 
    return res.status(200).json({token,onlyDataUser});
};

