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
               tipo_venta,observaciones,id_cliente,habilitado} = (req.body);
        const datosVenta = {
            id_ventas,
            nombre_cliente,
            list_monturas,
            list_lunas,
            observaciones,
            list_accesorios,
            id_vendedor,
            habilitado,
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
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
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
                //":val1" : '2022-12-06 00:00',
                //":val2" : '2022-12-06 20:09'
                ":val1" : fechaIni,
                ":val2" : fechaFin
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



/* 
    1.- Esta funcion permite validar si una venta que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/
const validateVenta  = async (idVenta) => {
    const id_venta  = idVenta;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsVenta = {
            TableName: TABLE_NAME_VENTAS,
            KeyConditionExpression:
              'id_ventas = :id_venta',
            ExpressionAttributeValues: {
                ":id_venta": id_venta,
            }
        };              
        const venta  = await dynamoClient.query(paramsVenta).promise();      
        return venta.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/*
    1.-  Funcion para Dar de Baja a una venta en especifico  
    2.-  Antes de dar de baja a una venta, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeVentasById = async (req, res) => {
    const id_venta = req.params.idVenta;
    const existeVenta = await validateVenta(id_venta);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeVenta.length > 0) {
        try {
            const paramsVenta = {
                TableName: TABLE_NAME_VENTAS,
                Key: {
                    "id_ventas":id_venta,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const venta = await dynamoClient.update(paramsVenta).promise();      
            res.json(venta);
            return venta;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('la venta no existe')
        return res.status(500).json({
            message:'La venta no existe'
        })
    }
};