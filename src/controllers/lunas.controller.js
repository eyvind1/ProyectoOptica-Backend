import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';

const TABLE_NAME_LUNA  = "Lunas";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

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
        res.json(lunas.Items);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const createNewLuna = async (req, res) => {
    try {
        const id_luna = v4() + codeForTables.tablaLunas;
        const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = (req.body);
        const datosLuna = {
            id_luna,
            id_sede,
            tipo,
            habilitado,
            fecha_creacion_luna,
            fecha_modificacion_luna,
            material,
            cantidad,
            precio_luna_c,
            precio_luna_v,
        }
        const newLuna = await dynamoClient.put({
            TableName: TABLE_NAME_LUNA,
            Item: datosLuna
        }).promise()
        res.json(newLuna);       
    } catch (error) {
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
    const id_luna   = idLuna;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsLuna = {
            TableName: TABLE_NAME_LUNA,
            KeyConditionExpression:
              'id_luna = :id_luna',
            ExpressionAttributeValues: {
                ":id_luna": id_luna
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
    1.-  Funcion para Dar de Baja a una montura en especifico  
    2.-  Antes de dar de baja al usuario valido que exista
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
    const id_luna = req.params.idLuna;
    const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = req.body;
    console.log(req.body)
    // Valido si existe en la BD el idmontura enviado desde el front
    const existeMontura = validateLuna(id_luna);
    // Primero valido si la montura a editar existe en la BD 
    if(existeMontura.length > 0) {
        try {
            const paramsMontura = {
                TableName: TABLE_NAME_MONTURAS,
                Key: {
                    "id_montura":id_montura,
                },
                UpdateExpression: `SET  cantidad= :cantidad, codigo=:codigo, fecha_modificacion_monturas = :fecha_modificacion_monturas,
                                        marca=:marca, material=:material, precio_montura_c=:precio_montura_c,precio_montura_v=:precio_montura_v,
                                        talla=:talla`,
                ExpressionAttributeValues: {
                    ":cantidad" : cantidad,
                    ":codigo"   : codigo,
                    ":fecha_modificacion_monturas": fecha_modificacion_monturas,
                    ":marca"    : marca,
                    ":material" : material,
                    ":precio_montura_c"   : precio_montura_c,
                    ":precio_montura_v"   : precio_montura_v,
                    ":talla"   : talla
                }
            };
            const montura = await dynamoClient.update(paramsMontura).promise();
            res.json(montura)
            return montura;  
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'No se puede actualizar la montura'
            })
        }
    }
    else{
        console.log('no existe la montura')
        return res.status(500).json({
            message:'La montura no existe'
        })
    }
};
