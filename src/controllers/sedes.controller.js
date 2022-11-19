import AWS from '../db.js'
import {v4} from 'uuid';

const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_SEDE  = "Sedes";

export const getAllSedes = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_SEDE
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
        const id_sede = v4() + 'sede';
        const {estado,fecha_creacion_sede,nombre_sede} = (req.body);
        const datosSede = {
            id_sede,
            estado,
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

