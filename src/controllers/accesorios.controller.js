import AWS from '../db.js'
import {v4} from 'uuid';
import { castIsoDateToDate}  from '../helpers/helperFunctions.js';

import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';

const TABLE_NAME_ACCESORIO = "Accesorios";
const dynamoClient         = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */
    /* Funcion que permite ordenar los datos al enviar al Front, segun la fecha de creacion del accesorio*/ 
async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(b.fecha_creacion_accesorio) - new Date(a.fecha_creacion_accesorio); // ascending order
      })
      return arrayJson;
}
    /* 
        1.- Esta funcion permite validar si un accesorio que se envia desde el front existe en la BD 
        2.- Funcion validada al 100%    
    */
const validateAccesorio  = async (idAccesorio) => {
    const id_accesorio   = idAccesorio;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsAccesorio = {
            TableName: TABLE_NAME_ACCESORIO,
            KeyConditionExpression:
              'id_producto = :id_accesorio',
            ExpressionAttributeValues: {
                ":id_accesorio": id_accesorio,
            }
        };              
        const accesorio  = await dynamoClient.query(paramsAccesorio).promise();      
        return accesorio.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}
/* End funciones que se utilizan en el archivo */ 

export const getAllAccesoriosForVenta = async (req, res) => {
    const id_sede = req.params.idSede;
    try {
        const params = {
            TableName: TABLE_NAME_ACCESORIO,
            FilterExpression : "#habilitado = :valueHabilitado and #cantidad > :valueCantidad and #id_sede = :valueSede",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueCantidad"  : 0,
                ":valueSede"      : id_sede
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#cantidad": "cantidad",
                "#id_sede":    "id_sede"
            }
        };
        const accesorios = await dynamoClient.scan(params).promise();
        const rpta       = await sortArrayJsonByDate(accesorios.Items); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }
};


export const getAllAccesorios = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_ACCESORIO,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const accesorios = await dynamoClient.scan(params).promise();
        const rpta       = await sortArrayJsonByDate(accesorios.Items); 
        return res.json(rpta);
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
        const id_producto = v4() + codeForTables.tablaAccesorios;
        const fecha     = new Date();
        const fecha_creacion_accesorio = await castIsoDateToDate(fecha);
        const {habilitado,tipo,nombre_accesorio,id_sede,cantidad,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = (req.body);
        const datosAccesorio = {
            id_producto,
            tipo,
            cantidad,
            id_sede,
            habilitado,
            nombre_accesorio,
            fecha_creacion_accesorio,
            fecha_modificacion_accesorio,
            precio_accesorio_c,
            precio_accesorio_v,
        }
        const newAccesorio = await dynamoClient.put({
            TableName: TABLE_NAME_ACCESORIO,
            Item: datosAccesorio,
            /* Ojo valido que el nuevo  id_producto no exista previamente, si no valido correctamente, lo que hace Dynamo
                por defecto es actualizar 
            */
            ConditionExpression: 'attribute_not_exists(id_producto)'
        }).promise()
        return res.json(newAccesorio);       
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message:error
        })
    }
};
/*
    1.-  Funcion para Dar de Baja a un accesorio en especifico  
    2.-  Antes de dar de baja a un accesorio valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeAccesoriosById = async (req, res) => {
    const id_accesorio = req.params.idAccesorio;
    const existeAccesorio = await validateAccesorio(id_accesorio);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeAccesorio.length > 0) {
        try {
            const paramsAccesorio = {
                TableName: TABLE_NAME_ACCESORIO,
                Key: {
                    "id_producto":id_accesorio,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const accesorio = await dynamoClient.update(paramsAccesorio).promise();      
            return res.json(accesorio);
        } catch (error) {
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        return res.status(500).json({
            message:'El accesorio no existe'
        })
    }
};

/*
    1.-  Funcion para editar un accesorio en especifico  
    2.-  Antes de editar el accesorio, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const editAccesorioById = async (req, res) => {
    const id_accesorio = req.params.idAccesorio;
    const {nombre_accesorio,cantidad,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = req.body;
    const existeAccesorio = await validateAccesorio(id_accesorio);
    try {
        const paramsAccesorio = {
            TableName: TABLE_NAME_ACCESORIO,
            Key: {
                "id_producto":id_accesorio,
            },
            UpdateExpression: `SET  cantidad= :cantidad, fecha_modificacion_accesorio = :fecha_modificacion_accesorio,
                                    nombre_accesorio=:nombre_accesorio,
                                    precio_accesorio_c=:precio_accesorio_c,precio_accesorio_v=:precio_accesorio_v`,
            ConditionExpression: "id_producto = :id_accesorio", 
            ExpressionAttributeValues: {
                ":id_accesorio" :id_accesorio, 
                ":cantidad" : cantidad,
                ":nombre_accesorio" : nombre_accesorio,
                ":fecha_modificacion_accesorio": fecha_modificacion_accesorio,
                ":precio_accesorio_c"   : precio_accesorio_c,
                ":precio_accesorio_v"   : precio_accesorio_v
            }
        };
        const accesorio = await dynamoClient.update(paramsAccesorio).promise();
        return res.json(accesorio)
    } catch (error) {
        return res.status(500).json({
            message:'No se puede actualizar el accesorio'
        })
    }
};
