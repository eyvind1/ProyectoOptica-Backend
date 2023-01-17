import AWS from '../db.js'
import {v4} from 'uuid';
import bcrypt from 'bcrypt';
/* Agregar md5 a la contra, indicar que el dni no se repita */

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_PERSONA  = "Persona";
const TABLE_NAME_USUARIO  = "Usuarios";

export const createNewUser = async (req, res) => {
    try {
        // Concateno el id_sede + su codigo especificado en el archivo util "CodigosTablas.js"
        const id_persona = v4() + codeForTables.tablaPersonas;
        const id_usuario = v4() + codeForTables.tablaUsers;
        //Obtengo los campos que se envia por POST desde el Front
        const {nombres,apellidos,dni,rol,habilitado,observaciones,email,
            fecha_creacion,fecha_nacimiento,fecha_modificacion,telefono,id_sede,contrasenia} = (req.body);
        // Encriptando la contrasenia recibida desde el front utilizando Bcrypt
        const salt                 = await bcrypt.genSalt(10);
        let contraseniaEncriptada  = await bcrypt.hash(contrasenia,salt);
        // Creo un usuario basandome en los primeros digitos del nombre, apellido, dni
        const usuario = apellidos.substr(0,3) + nombres.substr(0,2)+dni.substr(0,2);
        const newPersona = {
            id_persona,
            apellidos,
            dni,
            email,
            fecha_creacion,
            fecha_nacimiento,
            fecha_modificacion,
            nombres,
            telefono
        }
        const newUser = {
            id_usuario,
            usuario,
            observaciones,
            habilitado,
            id_persona,
            contraseniaEncriptada,
            id_sede,
            rol
        };
        console.log(newPersona,newUser)
        //Si no le pongo .promise, solo seria un callback        
        await dynamoClient.put({
            TableName: TABLE_NAME_PERSONA,
            Item: newPersona
        }).promise()
        const createdUser = await dynamoClient.put({
            TableName: TABLE_NAME_USUARIO,
            Item: newUser
        }).promise()
        res.json(createdUser);       
    } catch (error) {
        return res.status(500).json({ 
            message:'Algo anda mal al crear un Usuario'
        })
    }
};

/* 
    1.- Esta funcion permite validar si el usuario que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/

const validateUser = async (idUsuario) => {
    const id_usuario = idUsuario;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            KeyConditionExpression:
              'id_usuario= :id_usuario',
            ExpressionAttributeValues: {
                ":id_usuario": id_usuario
            }
        };
        const usuario  = await dynamoClient.query(paramsUsuario).promise();      
        return usuario.Items;
    } catch (error) {
        console.log(error)
        return error;
    }
}

/*
    1.-  Funcion para Dar de Baja a un usuario en especifico  
    2.-  Antes de dar de baja al usuario valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const darBajaUsuarioById = async (req, res) => {
    const id_usuario = req.params.idUsuario;
    const existeUsuario = await validateUser(id_usuario)
    console.log(existeUsuario);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeUsuario.length > 0) {
        try {
            //Primero actualizo datos de la tabla cliente
            console.log('entro al try')
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
            res.json(usuario);
            return usuario;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('no existe')
        return res.status(500).json({
            message:'El usuario no existe'
        })
    }
};
export const editUserById = async (req, res) => {
    const id_usuario = req.params.idUsuario;
    const id_persona = req.params.idPersona;
    //Aqui tengo que validar que ambos IDS llegue y ademas que existan para poder insertar
    const {id_sede,contrasenia,observaciones, apellidos,nombres,telefono,dni,email,fecha_nacimiento,fecha_modificacion,rol} = req.body;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    console.log(req.body)
    try {
        //Primero actualizo datos de la tabla cliente
        const paramsUsuario = {
            TableName: TABLE_NAME_USUARIO,
            Key: {
                "id_usuario":id_usuario,
            },
            UpdateExpression: "SET rol = :rol, id_sede=:id_sede,observaciones = :observaciones",
            ExpressionAttributeValues: {
                ":rol": rol,
                ":id_sede": id_sede,
                ":observaciones": observaciones
            }
        };
        const usuario = await dynamoClient.update(paramsUsuario).promise();
        //Segundo actualizo datos de la tabla persona
        const paramsPersona = {
            TableName: TABLE_NAME_PERSONA,
            Key: {
                "id_persona":id_persona,
            },
            UpdateExpression: `SET apellidos = :apellidos, nombres = :nombres,
                                   telefono = :telefono, dni=:dni, fecha_nacimiento=:fecha_nacimiento,
                                   fecha_modificacion=:fecha_modificacion, email=:email,contrasenia=:contrasenia`,
            ExpressionAttributeValues: {
                ":apellidos": apellidos,
                ":nombres"   : nombres,
                ":telefono"  : telefono,
                ":dni"       : dni,
                ":fecha_nacimiento" : fecha_nacimiento,
                ":fecha_modificacion" : fecha_modificacion,
                ":email"       : email,
                ":contrasenia" : contrasenia
            }
        };
        const persona = await dynamoClient.update(paramsPersona).promise();
        res.json(persona)
        return persona;  
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};

/* Estea funcion */ 
export const getAllUsers = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_USUARIO  = "Usuarios";
    const TABLE_NAME_PERSONA  = "Persona";
    let result={};
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
        let arr=[];
        let cont = 0;
        /* Segundo itero sobre cada usuario y obtengo la persona */
        usuarios.Items.map(async function(usuario,i)
        {
            const id_persona = usuario.id_persona
            result = await dynamoClient.get({
                TableName:TABLE_NAME_PERSONA,
                Key:{
                    id_persona
                }
            }).promise()
            result = {...usuario,...result.Item};
            arr.push(result);
            //Count es un atributo propio y devuelto por dinamo
            if(cont==usuarios.Count-1){   
                res.json(arr);
            }
            cont +=1;
        })
    } 
    catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};
/* Estea funcion */ 
export const getAllUsersById = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_USUARIO  = "Usuarios";
    const TABLE_NAME_PERSONA  = "Persona";
    let result={};
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
        let arr=[];
        let cont = 0;
        /* Segundo itero sobre cada usuario y obtengo la persona */
        usuarios.Items.map(async function(usuario,i)
        {
            const id_persona = usuario.id_persona
            result = await dynamoClient.get({
                TableName:TABLE_NAME_PERSONA,
                Key:{
                    id_persona
                }
            }).promise()
            result = {...usuario,...result.Item};
            arr.push(result);
            //Count es un atributo propio y devuelto por dinamo
            if(cont==usuarios.Count-1){   
                res.json(arr);
            }
            cont +=1;
        })
    } 
    catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};
