import AWS from '../db.js'
import {v4} from 'uuid';
import { accessKeyId } from '../config.js';

/* Esta funcion retorna infomacion del cliente unido a la info de la persona */
export const getAllClients = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_CLIENTE  = "Clientes";
    const TABLE_NAME_PERSONA  = "Persona";
    const id_persona = "45a21d56-15f3-4777-a153-971bf58f3962";
    const id_cliente = "546c3371-e0d3-4419-8743-f397d656afbb"
    let result={};
    try {
        /*Primero obtengo el json con todos los clientes */ 
        const params = {
            TableName: TABLE_NAME_CLIENTE
        };
        const characters = await dynamoClient.scan(params).promise();
        //let nose = characters.item.stringigy
        //console.log('length: ', characters.Count);
        let arr=[]
        characters.Items.map(async function(cliente,i)
        {
            const id_persona = cliente.id_persona
            result = await dynamoClient.get({
                TableName:'Persona',
                Key:{
                    id_persona
                }
            }).promise()
            result = {...cliente,...result.Item};
            arr.push(result)
            //console.log(result);
            if(i==characters.Count-1){   
                res.json(arr);
            }
        })
            
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

export const editClientById = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME = "Persona";

    try {
        const params = {
            TableName: TABLE_NAME
        };
        const characters = await dynamoClient.scan(params).promise();
        console.log(characters);
        res.json(characters)

        return characters;  
        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};

/* Esta funcion retorna infomacion del cliente unido a la info de la persona */

export const getAllClientsById = async (req, res) => {
    try {
        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

        var params = {
        TableName: 'Persona',
        Item: {
            'id_persona' : {S: '001'},
            'apellidos' : {S: 'Richard Roe'}
            }
        };

        // Call DynamoDB to add the item to the table
        ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
            res.send('error')
        } else {
            console.log("Success", data);
            res.send('persona insertada')
        }
        });
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};

/*
OJO ESTA FUNCION ESTA FUNCIONANDO, PERO FALTA VALIDAR LOS CAMPOS CON EL FRONT, NADA MAS
RECALCAR QUE EL CAMPO MEDIDA ES UNA LISTA DE OBJETOS
*/ 

export const createNewClient = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_PERSONA  = "Persona";
    const TABLE_NAME_CLIENTE  = "Clientes";

    //estado bool
    try {
        const id_persona = v4();
        const id_cliente = v4();

        const {nombres,apellidos,medidas,dni,fecha_creacion,fecha_modificacion,telefono} = (req.body);
        const newPersona = {
            id_persona,
            apellidos,
            dni,
            fecha_creacion,
            fecha_modificacion,
            nombres,
            telefono
        }
        const lentes = 'otro lente pe ';

        const newCliente = {
            id_cliente,
            id_persona,
            lentes,
            medidas
        }; 
        
        await dynamoClient.put({
            TableName: TABLE_NAME_PERSONA,
            Item: newPersona
        }).promise()
        
        const createdClient = await dynamoClient.put({
            TableName: TABLE_NAME_CLIENTE,
            Item: newCliente
        }).promise()
        res.json(createdClient);       
        
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};