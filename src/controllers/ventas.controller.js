import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_VENTAS = "Ventas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

/* Funcion*/ 
function castIsoDateToDate(fecha){
    const date = new Date(fecha);
    //const timestamp = date
    let mes     = (date.getMonth()+1).toString();
    let anio    = date.getFullYear();
    let dia     = date.getDate().toString();
    let hora    = date.getHours().toString();
    let minutos = date.getMinutes().toString();
    if (mes.length < 2) {
        mes = '0' + mes;
    }
    if (dia.length < 2) {
        dia = '0' + dia;
    }
    if (hora.length < 2) {
        hora = '0' + hora;
    }
    if (minutos.length < 2) {
        minutos = '0' + minutos;
    }
    const result = (anio+'-'+mes+'-'+ dia+' '+hora+':'+minutos);
    return result;
}
export const createNewVenta = async (req, res) => {
    try {
        const id_ventas = v4() + codeForTables.tablaVentas;
        const fecha_creacion_venta = castIsoDateToDate(req.body.fecha_creacion_venta);
        const {id_sede,nombre_cliente,list_monturas,list_lunas,list_accesorios,id_vendedor,
               tipo_venta,observaciones,id_cliente} = (req.body);
        const datosVenta = {
            id_ventas,
            nombre_cliente,
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


export const getAllVentasByDate = async (req, res) => {
    try{
        let fechaIni = req.params.fechaIni;
        let fechaFin = req.params.fechaFin;
        fechaIni = castIsoDateToDate(fechaIni);
        fechaFin = castIsoDateToDate(fechaFin); 
        console.log(fechaIni,' :', fechaFin);
        const params = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#fecha_venta  between :val1 and :val2",
            ExpressionAttributeValues: {
                ":val1" : '2022-12-06 00:00',
                ":val2" : '2022-12-06 20:09'
            },
            ExpressionAttributeNames:{
                "#fecha_venta": "fecha_creacion_venta"
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