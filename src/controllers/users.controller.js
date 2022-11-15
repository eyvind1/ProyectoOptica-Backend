import AWS from '../db.js'
import {v4} from 'uuid';

export const createNewUser = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const id  = v4();
    const fecha_creacion = new Date();
    console.log('id generado: ',id, ' ', fecha_creacion)

    const TABLE_NAME = "Usuarios";

    try {
        const {nombres,apellidos,dni,rol,estado,fecha_creacion,fecha_modificacion,telefono} = JSON.parse(req.body);
        const newUser = {
            id,
            title,
            fecha_creacion
        };
        
        console.log(nombres,apellidos,dni,rol,estado,fecha_creacion,fecha_modificacion,telefono,dni);
        res.send('ok');
        //Si no le pongo .promise, solo seria un callback
        /*await dynamodb.put({
            TableName: TABLE_NAME,
            Item:{
                newUser
             }
        }).promise()
        return {
            statusCode:200,
            body:JSON.stringify(newUser);
        }*/
        
    } catch (error) {
        return res.status(500).json({ 
            message:'Algo anda mal'
        })
    }
};

export const getAllUser = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME = "Usuarios";

    try {
        const {nombres,apellidos,dni} = req.body;
        const params = {
            TableName: TABLE_NAME
        };
        const characters = await dynamoClient.scan(params).promise();
        console.log(characters);
        res.send('ok')

        return characters;  
        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};


