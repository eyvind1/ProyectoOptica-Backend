import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_CAJA  = "Caja";
const dynamoClient = new AWS.DynamoDB.DocumentClient();


export const createNewIngreso = async (req, res) => {
    try {
        const id_caja = v4() + codeForTables.tablaCaja;
        const {id_sede,descripcion,encargado,egreso,fecha_creacion_caja} = (req.body);
        const datosCaja = {
            id_caja,
            id_sede,
            egreso,
            descripcion,
            encargado
            //fecha_creacion_caja,
        }
        const newCaja = await dynamoClient.put({
            TableName: TABLE_NAME_CAJA,
            Item: datosCaja
        }).promise()
        res.json(newCaja);       
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message:error
        })
    }
};
