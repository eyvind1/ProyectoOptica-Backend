import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';
import {castIsoDateToDate}  from '../helpers/helperFunctions.js';

const TABLE_NAME_CAJA  = "Caja";
const dynamoClient     = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */
    /* Funcion que permite ordenar los datos al enviar al Front, segun la fecha de creacion del ingreso*/ 
async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(b.fecha_creacion_caja) - new Date(a.fecha_creacion_caja); // descending
      })
      return arrayJson;
}
async function getIngresosEgresos(datos,fecha_especifica){
    //Itera sobre cada registro de la bd
    let newArray = datos.filter(function (el) {
        //Recorto el string para solo quedarme con la fecha asi "2022-03-10" sin horas
        return el.fecha_creacion_caja.slice(0,10) === fecha_especifica 
    });
    return newArray;
}
/* End funciones que se utilizan en el archivo */ 

export const createNewIngreso = async (req, res) => {
    const id_caja = v4() + codeForTables.tablaCaja;
            const fecha     = new Date();
            const fecha_creacion_caja = await castIsoDateToDate(fecha);
    try {
        const {id_sede,metodo_pago,monto,descripcion,id_encargado,nombre_encargado,habilitado,egreso} = (req.body);
        const datosCaja = {
            id_caja,
            id_sede,
            metodo_pago,
            //tipo,
            monto,
            egreso,
            descripcion,
            id_encargado,
            nombre_encargado,
            habilitado,
            fecha_creacion_caja,
        }
        const newCaja = await dynamoClient.put({
            TableName: TABLE_NAME_CAJA,
            Item: datosCaja
        }).promise()
        return res.json(newCaja);       
    } catch (error) {
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
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults);
        return res.json(rpta);
    } 
     catch(error) {
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
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

/*
    1.-  Funcion para Dar de Baja a un egreso en especifico  
    2.-  Antes de dar de baja a un accesorio valido que exista
    3.-  Funcion Verificada al 100%
    4.-  Egreso e ingreso estan en una sola tabla ojo, idCaja se refiere aL ID_INGRESO O ID_EGRESO es igual
*/ 
export const unsubscribeEgresoById = async (req, res) => {
    const id_caja = req.params.idCaja;
    try {
        const paramsCaja = {
            TableName: TABLE_NAME_CAJA,
            Key: {
                "id_caja":id_caja
            },
            UpdateExpression: "SET habilitado = :habilitado",
            ConditionExpression: "id_caja = :id_caja", 
            ExpressionAttributeValues: {
                ":habilitado": false,
                ":id_caja": id_caja,
            }
        };
        const caja = await dynamoClient.update(paramsCaja).promise();      
        return res.json(caja);
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
};

// Esta funcion retorna egresos en un rango de fechas 

export const getAllIngresosByDate = async (req, res) => {
    try {
        let fechaIni = req.params.fechaIni;
        let fechaFin = req.params.fechaFin;
        let id_sede  = req.params.idSede;

        fechaIni     = await castIsoDateToDate(fechaIni);
        fechaFin     = await castIsoDateToDate(fechaFin); 
        const params = {
            TableName: TABLE_NAME_CAJA,
            FilterExpression : "#habilitado = :valueHabilitado and egreso = :valueEgreso and  #fecha_creacion_caja  between :val1 and :val2 and #id_sede = :id_sede ",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueEgreso": false,
                ":val1" : fechaIni,
                ":val2" : fechaFin,
                ":id_sede" : id_sede
            },
            ExpressionAttributeNames:{
                "#fecha_creacion_caja": "fecha_creacion_caja",
                "#habilitado" : "habilitado",
                "#id_sede" : "id_sede",
            }
        };
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};



// Esta funcion retorna ingresos y egresos por mes, filtrando por dia
export const getAllCajaPerMonths = async (req, res) => {
    try {
        let fechaIni = req.params.fechaIni;
        let fechaFin = req.params.fechaFin;
        let id_sede  = req.params.idSede;
        fechaIni     = await castIsoDateToDate(fechaIni);
        fechaFin     = await castIsoDateToDate(fechaFin); 
        //Array que contendra todos los dias que existe entre las fechas que envia el front
        let arr_container_days = [];
        var getDaysArray = function(s,e) {for(var a=[],d=new Date(s);d<=new Date(e);d.setDate(d.getDate()+1)){ a.push(new Date(d));}return a;};
        var daylist = getDaysArray(new Date(fechaIni),new Date(fechaFin));
        daylist.map((v)=> arr_container_days.push(v.toISOString().slice(0,10)))
        
        const params = {
            TableName: TABLE_NAME_CAJA,
            FilterExpression : "#habilitado = :valueHabilitado and  #fecha_creacion_caja  between :val1 and :val2 and #id_sede = :id_sede",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":val1" : fechaIni,
                ":val2" : fechaFin,
                ":id_sede" : id_sede,
            },
            ExpressionAttributeNames:{
                "#fecha_creacion_caja": "fecha_creacion_caja",
                "#habilitado" : "habilitado",
                "#id_sede" : "id_sede"
            }
        };
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};

export const getAllEgresosByDate = async (req, res) => {
    try {
        let fechaIni = req.params.fechaIni;
        let fechaFin = req.params.fechaFin;
        let id_sede  = req.params.idSede;
        fechaIni     = await castIsoDateToDate(fechaIni);
        fechaFin     = await castIsoDateToDate(fechaFin); 
        const params = {
            TableName: TABLE_NAME_CAJA,
            FilterExpression : "#habilitado = :valueHabilitado and egreso = :valueEgreso and  #fecha_creacion_caja  between :val1 and :val2 and #id_sede = :id_sede",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueEgreso": true,
                ":val1" : fechaIni,
                ":val2" : fechaFin,
                ":id_sede" : id_sede,
            },
            ExpressionAttributeNames:{
                "#fecha_creacion_caja": "fecha_creacion_caja",
                "#habilitado" : "habilitado",
                "#id_sede" : "id_sede"
            }
        };
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};