import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';
import { castIsoDateToDate}  from '../helpers/helperFunctions.js';

const TABLE_NAME_LUNA  = "Lunas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();


async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(a.num_orden) - new Date(b.num_orden); // ascending order
      })
      return arrayJson
}
/* End funciones que se utilizan en el archivo */ 

export const getAllLunasForVenta = async (req, res) => {
    const id_sede = req.params.idSede;
    try {
        const params = {
            TableName: TABLE_NAME_LUNA,
            FilterExpression : "#habilitado = :valueHabilitado and #cantidad > :valueCantidad and #id_sede = :valueSede",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueCantidad": 0,
                ":valueSede": id_sede

            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#cantidad": "cantidad",
                "#id_sede":    "id_sede"
            }
        };
        const lunas = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(lunas.Items); 
        res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};

export const getAllLunas = async (req, res) => {
    try {
        const params = {
            TableName: TABLE_NAME_LUNA,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const lunas = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(lunas.Items); 
        res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const createNewLuna = async (req, res) => {
    try {
        const id_producto = v4() + codeForTables.tablaLunas;
        //const {id_sede,num_orden,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = (req.body);
        const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = (req.body);
        
        //let formatoFecha   = await castIsoDateToDate(fecha_creacion_luna);
        //let codigo_interno = num_orden.toString()+ formatoFecha+prefixesForProducts.ProdLuna; 
        const datosLuna = {
            id_producto,
            id_sede,
            //num_orden,
            tipo,
            habilitado,
            //codigo_interno,
            fecha_creacion_luna,
            fecha_modificacion_luna,
            material,
            cantidad,
            precio_luna_c,
            precio_luna_v,
        }
        const newLuna = await dynamoClient.put({
            TableName : TABLE_NAME_LUNA,
            Item      : datosLuna
        }).promise()
        return res.json(newLuna);       
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message:error
        })
    }
};

/* 
    1.- Esta funcion permite validar si la luna que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/

const validateLuna  = async (idLuna) => {
    const id_producto   = idLuna;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsLuna = {
            TableName: TABLE_NAME_LUNA,
            KeyConditionExpression:
              'id_producto = :id_producto',
            ExpressionAttributeValues: {
                ":id_producto": id_producto
            }
        };
        const luna  = await dynamoClient.query(paramsLuna).promise();      
        return luna.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/*
    1.-  Funcion para Dar de Baja a una luna en especifico  
    2.-  Antes de dar de baja a una luna valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeLunasById = async (req, res) => {
    const id_luna = req.params.idLuna;
    const existeLuna = await validateLuna(id_luna);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeLuna.length > 0) {
        try {
            //Primero actualizo datos de la tabla cliente
            const paramsLuna = {
                TableName: TABLE_NAME_LUNA,
                Key: {
                    "id_luna":id_luna,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const luna = await dynamoClient.update(paramsLuna).promise();      
            res.json(luna);
            return luna;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('no existe la luna')
        return res.status(500).json({
            message:'La luna no existe'
        })
    }
};
/*
    1.-  Funcion para editar una luna en especifico  
    2.-  Antes de editar la luna, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const editLunaById = async (req, res) => {
    const id_producto = req.params.idLuna;
    const {cantidad,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = req.body;
    // Valido si existe en la BD el idmontura enviado desde el front
    const existeLuna = await validateLuna(id_producto);
    // Primero valido si la montura a editar existe en la BD 
    if(existeLuna.length > 0) {
        try {
            const paramsLuna = {
                TableName: TABLE_NAME_LUNA,
                Key: {
                    "id_producto":id_producto,
                },
                UpdateExpression: `SET  cantidad= :cantidad, fecha_modificacion_luna = :fecha_modificacion_luna,
                                        material=:material, precio_luna_c=:precio_luna_c,precio_luna_v=:precio_luna_v`,
                ExpressionAttributeValues: {
                    ":cantidad" : cantidad,
                    ":fecha_modificacion_luna": fecha_modificacion_luna,
                    ":material" : material,
                    ":precio_luna_c"   : precio_luna_c,
                    ":precio_luna_v"   : precio_luna_v
                }
            };
            const luna = await dynamoClient.update(paramsLuna).promise();
            res.json(luna)
            return luna;  
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'No se puede actualizar la luna'
            })
        }
    }
    else{
        console.log('no existe la Luna')
        return res.status(500).json({
            message:'La luna no existe'
        })
    }
};
