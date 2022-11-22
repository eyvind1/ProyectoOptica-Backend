import AWS from '../db.js'
import {v4} from 'uuid';

export const getAllMonturas = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_MONTURAS  = "Monturas";
    try {
        /* Obtengo todas las monturas */ 
        const params = {
            TableName: TABLE_NAME_MONTURAS
        };
        const monturas = await dynamoClient.scan(params).promise();
        res.json(monturas.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

export const createNewMontura = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_MONTURA  = "Monturas";
    try {
        const id_montura = v4();
        const {id_sede,habilitado,cantidad,codigo,codigo_interno,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = (req.body);
        const datosMontura = {
            id_montura,
            cantidad,
            habilitado,
            codigo,
            id_sede,
            codigo_interno,
            fecha_creacion_monturas,
            fecha_modificacion_monturas,
            marca,
            material,
            precio_montura_c,
            precio_montura_v,
            talla
        }
        //Si no le pongo .promise, solo seria un callback        
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

