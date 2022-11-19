import AWS from '../db.js'
import {v4} from 'uuid';

const TABLE_NAME_ACCESORIO = "Accesorios";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

export const getAllAccesorios = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_ACCESORIO
        };
        const accesorios = await dynamoClient.scan(params).promise();
        res.json(accesorios.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};


export const createNewAccesorio = async (req, res) => {
    try {
        const id_montura = v4();
        const {cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = (req.body);
        const datosMontura = {
            id_montura,
            cantidad,
            codigo,
            fecha_creacion_monturas,
            fecha_modificacion_monturas,
            marca,
            material,
            precio_montura_c,
            precio_montura_v,
            talla
        }
        const newMontura = await dynamoClient.put({
            TableName: TABLE_NAME_MONTURA,
            Item: datosMontura
        }).promise()
        res.json(newMontura);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};