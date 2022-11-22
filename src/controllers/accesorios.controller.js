import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';


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

/* Esta funcion falta terminar, queda en stand by  */
export const createNewAccesorio = async (req, res) => {
    try {
        //Concatenar con la letra de la tabla
        const id_montura = v4() + codeForTables.tablaAccesorios;
        const {habilitado,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = (req.body);
        const datosAccesorio = {
            id_montura,
            cantidad,
            id_sede,
            habilitado,
            fecha_creacion_accesorio,
            fecha_modificacion_accesorio,
            precio_montura_c,
            precio_montura_v,
        }
        const newAccesorio = await dynamoClient.put({
            TableName: TABLE_NAME_MONTURA,
            Item: datosAccesorio
        }).promise()
        res.json(newAccesorio);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};