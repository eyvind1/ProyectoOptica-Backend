import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_VENTAS = "Ventas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

export const createNewVenta = async (req, res) => {
    try {
        const id_ventas = v4() + codeForTables.tablaVentas;
        const {id_sede,list_monturas,list_lunas,list_accesorios,id_vendedor,
                fecha_creacion_venta,tipo_venta,observaciones,id_cliente} = (req.body);
        const datosVenta = {
            id_ventas,
            list_monturas,
            list_lunas,
            observaciones,
            list_accesorios,
            id_vendedor,
            fecha_creacion_venta,
            tipo_venta,
            id_sede,
            id_cliente
        }
        const newVenta = await dynamoClient.put({
            TableName: TABLE_NAME_VENTAS,
            Item: datosVenta
        }).promise()
        res.json(newVenta);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};

/* Esta funcion lista todas las ventas */
export const getAllVentasBySede = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_VENTAS,
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

/* Esta funcion lista todas las ventas */
export const getAllVentas = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_VENTAS,
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
/* Esta funcion lista todas las ventas por vendedor */
export const getAllVentasBySeller = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_VENTAS,
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