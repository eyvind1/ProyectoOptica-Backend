import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_LUNA  = "Lunas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

export const getAllLunas = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_LUNA
        };
        const lunas = await dynamoClient.scan(params).promise();
        res.json(lunas.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const createNewLuna = async (req, res) => {
    try {
        const id_luna = v4() + codeForTables.tablaLunas;
        const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = (req.body);
        const datosLuna = {
            id_luna,
            id_sede,
            tipo,
            habilitado,
            fecha_creacion_luna,
            fecha_modificacion_luna,
            material,
            cantidad,
            precio_luna_c,
            precio_luna_v,
        }
        const newLuna = await dynamoClient.put({
            TableName: TABLE_NAME_LUNA,
            Item: datosLuna
        }).promise()
        res.json(newLuna);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};

