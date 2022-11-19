import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_SEDE  = "Sedes";

/* Esta funcion lista todas las sedes que se encuentran con "estado = true" */
export const getAllSedes = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_SEDE,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado": true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const sedes = await dynamoClient.scan(params).promise();
        res.json(sedes.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};
export const createNewSede = async (req, res) => {
    try {
        // Concateno el id_sede + su codigo especificado en el archivo util "CodigosTablas.js"
        const id_sede = v4() + codeForTables.tablaSedes;
        const {estado,fecha_creacion_sede,nombre_sede} = (req.body);
        const datosSede = {
            id_sede,
            habilitado,
            direccion,
            fecha_creacion_sede,
            nombre_sede
        }
        const newSede = await dynamoClient.put({
            TableName: TABLE_NAME_SEDE,
            Item: datosSede
        }).promise()
        res.json(newSede);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};

