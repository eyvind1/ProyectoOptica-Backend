import AWS from '../db.js'
import {v4} from 'uuid';
import bcrypt from 'bcrypt';

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
import { validarDni}  from '../helpers/helperFunctions.js';

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_USUARIO  = "Usuarios";

/* Funcion especifica para encriptar una contrasenia con Bcrypt*/
async function encriptarPassword(contrasenia){
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(contrasenia,salt);
}

/*  Funcion que permite validar Dni solo al momento de crear un usuario 
    1.- Obligatoriamente tiene que verificar solamente sobre usuarios habilitados porque los dados de baja 
        podrian haber tenido el mismo DNI
*/ 
async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion); // ascending order
      })
      return arrayJson;
}
/* 
    Funcion que permite crear un nuevo usuario 
    
    VALIDACIONES 
    ----------------------------------------------------------------
    1.- No debe existir un usuario habilitado con el mismo DNI 
*/
export const createNewUser = async (req, res) => {
    try {
        // Concateno el id_sede + su codigo especificado en el archivo util "CodigosTablas.js"
        const id_usuario = v4() + codeForTables.tablaUsers;
        //Obtengo los campos que se envia por POST desde el Front
        let {nombres,apellidos,dni,rol,habilitado,observaciones,email,
            fecha_creacion,fecha_nacimiento,fecha_modificacion,telefono,id_sede,contrasenia} = (req.body);
        // Validamos que el DNI no sea repetido
        const dniValidado = await validarDni(dni, TABLE_NAME_USUARIO);
        if(dniValidado>0){
            return res.status(400).json({ 
                message:'Dni Duplicado'
            })
        }
        // Encriptando la contrasenia recibida desde el front utilizando Bcrypt
        contrasenia = await encriptarPassword(contrasenia);
        // Creo un usuario basandome en los primeros digitos del nombre, apellido, dni
        const usuario = apellidos.substr(0,3) + nombres.substr(0,2)+dni.substr(0,2);
      
        const newUser = {
            id_usuario,
            apellidos,
            dni,
            email,
            fecha_creacion,
            fecha_nacimiento,
            fecha_modificacion,
            nombres,
            telefono,
            usuario,
            observaciones,
            habilitado,
            contrasenia,
            id_sede,
            rol
        };
        //Si no le pongo .promise, solo seria un callback        
        const createdUser = await dynamoClient.put({
            TableName: TABLE_NAME_USUARIO,
            Item: newUser
        }).promise()
        return res.json(createdUser);       
    } catch (error) {
        return res.status(500).json({ 
            message:'Algo anda mal al crear un Usuario'
        })
    }
};
/*
    1.-  Funcion para Dar de Baja a un usuario en especifico  
    2.-  Antes de dar de baja al usuario valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const darBajaUsuarioById = async (req, res) => {
    const id_usuario = req.params.idUsuario;
    try {
        //Primero actualizo datos de la tabla cliente
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            Key: {
                "id_usuario":id_usuario,
            },
            UpdateExpression: "SET habilitado = :habilitado",
            ExpressionAttributeValues: {
                ":habilitado": false
            }
        };
        const usuario = await dynamoClient.update(paramsUsuario).promise();      
        return res.json(usuario);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};

export const editUserById = async (req, res) => {
    const id_usuario = req.params.idUsuario;
    //Aqui tengo que validar que ambos IDS llegue y ademas que existan para poder insertar
    const {id_sede,observaciones, apellidos,nombres,telefono,email,fecha_nacimiento,fecha_modificacion,rol} = req.body;
    //let contraseniaEncriptada = await encriptarPassword(contrasenia);
    try {
        //Primero actualizo datos de la tabla cliente
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            Key: {
                "id_usuario":id_usuario,
            },
            UpdateExpression: `SET rol = :rol, id_sede=:id_sede,observaciones = :observaciones,
                                   apellidos = :apellidos, nombres = :nombres,
                                   telefono = :telefono,fecha_nacimiento=:fecha_nacimiento,
                                   fecha_modificacion=:fecha_modificacion, email=:email`,
            ExpressionAttributeValues: {
                ":rol": rol,
                ":id_sede": id_sede,
                ":observaciones": observaciones,
                ":apellidos": apellidos,
                ":nombres"   : nombres,
                ":telefono"  : telefono,
                ":fecha_nacimiento" : fecha_nacimiento,
                ":fecha_modificacion" : fecha_modificacion,
                ":email"       : email
            }
        };
        const usuario = await dynamoClient.update(paramsUsuario).promise();
        return res.json(usuario.Items);
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};

export const getAllUsers = async (req, res) => {
    const TABLE_NAME_USUARIO  = "Usuarios";
    try {
        /* Obtengo el json con todos los usuarios */ 
        const params = {
            TableName: TABLE_NAME_USUARIO,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const usuarios = await dynamoClient.scan(params).promise();
        const rpta     = await sortArrayJsonByDate(usuarios.Items); 
        return res.json(rpta);
    } 
    catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};

export const getAllUsersById = async (req, res) => {
    try {
        /*Primero obtengo el json con todos los usuarios */ 
        const params = {
            TableName: TABLE_NAME_USUARIO,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const usuarios = await dynamoClient.scan(params).promise();
        const rpta     = await sortArrayJsonByDate(usuarios.Items); 
        return res.json(rpta);
    } 
    catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};
