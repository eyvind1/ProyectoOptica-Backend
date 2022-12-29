import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_CAJA  = "Caja";
const dynamoClient = new AWS.DynamoDB.DocumentClient();


export const createNewIngreso = async (req, res) => {
    const id_caja = v4() + codeForTables.tablaCaja;
    try {
        const {id_sede,monto,descripcion,encargado,habilitado,egreso,fecha_creacion_caja} = (req.body);
        const datosCaja = {
            id_caja,
            id_sede,
            monto,
            egreso,
            descripcion,
            encargado,
            habilitado,
            fecha_creacion_caja,
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


export const getAllEgresos = async (req, res) => {
    try {
        /* Obtengo todos los egresos */ 
        const params = {
            TableName: TABLE_NAME_CAJA,
            FilterExpression : "#habilitado = :valueHabilitado and egreso = :valueEgreso",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueEgreso": true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const egresos = await dynamoClient.scan(params).promise();
        res.json(egresos.Items);
    } 
     catch(error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
      }
};

/* 
     Funcion Verificada
     1.-el campo egreso es falso si es un ingreso
*/ 
export const getAllIngresos = async (req, res) => {
    try {
        /* Obtengo todos los ingresos */ 
        const params = {
            TableName: TABLE_NAME_CAJA,
            FilterExpression : "#habilitado = :valueHabilitado and egreso = :valueEgreso",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueEgreso": false
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const ingresos = await dynamoClient.scan(params).promise();
        res.json(ingresos.Items);
    } 
     catch(error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
      }
};
