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

/* Esta funcion busca todas las ventas de una sede en especifica */
export const getAllVentasBySede = async (req, res) => {
    try{
        let id_sede = req.params.idsede;
        const params = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#idsede = :valueSede",
            ExpressionAttributeValues: {
                ":valueSede": id_sede
            },
            ExpressionAttributeNames:{
                "#idsede": "id_sede"
            }
        };
        const ventasBySede = await dynamoClient.scan(params).promise();
        res.json(ventasBySede.Items);
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
        let id_vendedor = req.params.idvendedor;
        const params = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#idVendedor = :valueIdVendedor",
            ExpressionAttributeValues: {
                ":valueIdVendedor": id_vendedor
            },
            ExpressionAttributeNames:{
                "#idVendedor": "id_vendedor"
            }
        };
        const ventasBySeller = await dynamoClient.scan(params).promise();
        res.json(ventasBySeller.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};