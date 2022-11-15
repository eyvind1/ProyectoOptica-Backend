import AWS from '../db.js'
import {v4} from 'uuid';
/* 
*/
export const createNewUser = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_PERSONA  = "Persona";
    const TABLE_NAME_USUARIO  = "Usuarios";

    //estado bool
    try {
        const id_persona = v4();
        const id_usuario = v4();

        const {nombres,apellidos,dni,rol,estado,fecha_creacion,fecha_modificacion,telefono} = (req.body);
        const newPersona = {
            id_persona,
            apellidos,
            dni,
            fecha_creacion,
            fecha_modificacion,
            nombres,
            telefono
        }
        const newUser = {
            id_usuario,
            estado,
            fecha_creacion,
            id_persona,
            rol
        };
        
        console.log(nombres,apellidos,dni,rol,estado,fecha_creacion,fecha_modificacion,telefono);
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
        
        
        /*return {
            statusCode:200,
            //body:JSON.stringify(newPersona)
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


