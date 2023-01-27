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




/*
    1.-  Funcion para Dar de Baja a un egreso en especifico  
    2.-  Antes de dar de baja a un accesorio valido que exista
    3.-  Funcion Verificada al 100%
    4.-  Egreso e ingreso estan en una sola tabla ojo, idCaja se refiere aL ID_INGRESO O ID_EGRESO es igual
*/ 
export const unsubscribeEgresoById = async (req, res) => {
    const id_caja = req.params.idCaja;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeAccesorio.length > 0) {
        try {
            const paramsAccesorio = {
                TableName: TABLE_NAME_ACCESORIO,
                Key: {
                    "id_accesorio":id_accesorio,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const accesorio = await dynamoClient.update(paramsAccesorio).promise();      
            res.json(accesorio);
            return accesorio;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('no existe el accesorio')
        return res.status(500).json({
            message:'El accesorio no existe'
        })
    }
};