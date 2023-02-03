import AWS from '../db.js'
import {v4} from 'uuid';
import {codeForTables} from '../utils/codigosTablas.js';
import { validarDni }  from '../helpers/helperFunctions.js';

const TABLE_NAME_CLIENTE  = "Clientes";
const dynamoClient        = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */ 

async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(b.fecha_creacion) - new Date(a.fecha_creacion); // descending
      })
      return arrayJson;
}

/* End funciones que se utilizan en el archivo */ 

export const getAllClientsMinified = async (req, res) => {
    try {
        /*Primero obtengo el json con todos los clientes */ 
        const params = {
            TableName: TABLE_NAME_CLIENTE,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            "ProjectionExpression": "id_cliente, apellidos ,nombres,dni,email,telefono,fecha_nacimiento,direccion",
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
            },
        };
        const clientes = await dynamoClient.scan(params).promise();
        const rpta     = await sortArrayJsonByDate(clientes.Items); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

export const getClientById = async (req, res) => {
    const id_cliente = req.params.idCliente;
    try {
        /*Primero obtengo el json con todos los usuarios */ 
        const params = {
            TableName: TABLE_NAME_CLIENTE,
            FilterExpression : "#habilitado = :valueHabilitado and #id_cliente = :valueIdCliente",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueIdCliente":id_cliente
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#id_cliente": "id_cliente"
            },
            "ProjectionExpression": "id_cliente,medidas,apellidos,nombres,dni,email,telefono,fecha_nacimiento,direccion"
        };
        const cliente = await dynamoClient.scan(params).promise();
        return res.json(cliente.Items);

    } 
    catch(error) {
        console.log(error);
        return res.status(500).json({
            message:error
        })
      }
}

export const getAllClients = async (req, res) => {
    const TABLE_NAME_CLIENTE  = "Clientes";
    try {
        /*Primero obtengo el json con todos los clientes */ 
        const params = {
            TableName: TABLE_NAME_CLIENTE,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
            },
        };
        const clientes = await dynamoClient.scan(params).promise();
        const rpta     = await sortArrayJsonByDate(clientes.Items); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

/* Dar de Baja al Cliente */ 
export const darBajaClienteById = async (req, res) => {
    const id_cliente = req.params.idCliente;
    try {
        //Primero actualizo datos de la tabla cliente
        const paramsUsuario = {
            TableName: TABLE_NAME_CLIENTE,
            Key: {
                "id_cliente":id_cliente,
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

export const editClientById = async (req, res) => {
    const id_cliente = req.params.idCliente;
    const {medidas, apellidos,nombres,telefono,dni,email,fecha_nacimiento,antecedentes} = req.body;
    try {
        //Primero actualizo datos de la tabla cliente
        const paramsCliente = {
            TableName: TABLE_NAME_CLIENTE,
            Key: {
                "id_cliente":id_cliente,
            },
            UpdateExpression: `SET medidas = :medidas, antecedentes = :antecedentes, apellidos = :apellidos, nombres = :nombres,
                                    telefono = :telefono,fecha_nacimiento=:fecha_nacimiento,
                                    email=:email `,
            ExpressionAttributeValues: {
                ":medidas": medidas,
                ":antecedentes": antecedentes,
                ":apellidos": apellidos,
                ":nombres"   : nombres,
                ":telefono"  : telefono,
                ":fecha_nacimiento" : fecha_nacimiento,
                ":email"       : email
            }
        };
        const cliente = await dynamoClient.update(paramsCliente).promise();
        return res.json(cliente)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};

/*
     Validaciones
     1.- Validamos que el dni ingresado no exista en la tabla Clientes
*/ 
export const createNewClient = async (req, res) => {
    //estado bool
    try {
        const id_cliente = v4() + codeForTables.tablaClients;

        const {nombres,apellidos,direccion,antecedentes,medidas,dni,fecha_nacimiento,email,fecha_creacion,fecha_modificacion,telefono,habilitado} = (req.body);
        const dniValidado = await validarDni(dni,TABLE_NAME_CLIENTE);
        if(dniValidado>0){
            return res.status(400).json({ 
                message:'Dni Duplicado'
            })
        }
        const newCliente = {
            id_cliente,
            habilitado,
            direccion,
            antecedentes,
            medidas,
            apellidos,
            dni,
            fecha_nacimiento,
            fecha_creacion,
            fecha_modificacion,
            nombres,
            email,
            telefono
        };     
        const createdClient = await dynamoClient.put({  
            TableName: TABLE_NAME_CLIENTE,
            Item: newCliente
        }).promise()
        return res.json(createdClient);       
        
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};