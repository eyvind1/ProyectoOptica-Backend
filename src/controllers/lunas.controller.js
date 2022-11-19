import AWS from '../db.js'
import {v4} from 'uuid';

const TABLE_NAME_LUNA  = "Lunas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

export const getAllLunas = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_LUNA
        };
        const lunas = await dynamoClient.scan(params).promise();
        res.json(lunas);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const createNewLuna = async (req, res) => {
    try {
        const id_luna = v4();
        const {cantidad,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = (req.body);
        const datosMontura = {
            id_luna,
            fecha_creacion_luna,
            fecha_modificacion_luna,
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

