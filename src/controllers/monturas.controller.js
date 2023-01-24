import AWS from '../db.js'
import {v4} from 'uuid';
import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';
import { customAlphabet} from 'nanoid';

/* Variables Globales que se utilizan en las funciones */ 

const TABLE_NAME_MONTURAS  = "Monturas";
const dynamoClient         = new AWS.DynamoDB.DocumentClient();


export const getAllMonturasForVenta = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        /* Obtengo todas las monturas */ 
        const params = {
            TableName: TABLE_NAME_MONTURAS,
            FilterExpression : "#habilitado = :valueHabilitado and #cantidad > :valueCantidad",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":valueCantidad": 0
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#cantidad": "cantidad"
            }
        };
        const monturas = await dynamoClient.scan(params).promise();
        res.json(monturas.Items);
    } 
     catch(error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
      }
};

export const getAllMonturas = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        /* Obtengo todas las monturas */ 
        const params = {
            TableName: TABLE_NAME_MONTURAS,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const monturas = await dynamoClient.scan(params).promise();
        res.json(monturas.Items);
    } 
     catch(error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
      }
};

/*
    1.- Funcion para crear una nueva montura 
    2.- Funcion completa al 100% 
 */
export const createNewMontura = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const id_montura   = v4() + codeForTables.tablaMonturas;
        //Genero el codigo interno para el codigo de barras
        const nanoid       = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',6)
        let codigo_interno = nanoid() + prefixesForProducts.ProdMontura; 

        const {id_sede,num_orden,tipo,habilitado,color,cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = (req.body);
        const datosMontura = {
            id_montura,
            tipo,
            num_orden,
            color,
            cantidad,
            habilitado,
            codigo,
            id_sede,
            codigo_interno,
            fecha_creacion_monturas,
            fecha_modificacion_monturas,
            marca,
            material,
            precio_montura_c,
            precio_montura_v,
            talla
        }
        //Si no le pongo .promise, solo seria un callback        
        const newMontura = await dynamoClient.put({
            TableName: TABLE_NAME_MONTURAS,
            Item: datosMontura
        }).promise()
        res.json(newMontura);       
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            message:error
        })
    }
};

/* 
    1.- Esta funcion permite validar si la montura que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/

const validateMontura  = async (idMontura) => {
    const id_montura   = idMontura;
    console.log('id montura: ', id_montura)
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsMontura = {
            TableName: TABLE_NAME_MONTURAS,
            KeyConditionExpression:
              'id_montura = :id_montura',
            ExpressionAttributeValues: {
                ":id_montura": id_montura
            }
        };
        const montura  = await dynamoClient.query(paramsMontura).promise();      
        return montura.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}
/*
    1.-  Funcion para Dar de Baja a una montura en especifico  
    2.-  Antes de dar de baja a una montura valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeMonturasById = async (req, res) => {
    const id_montura = req.params.idMontura;
    const existeMontura = await validateMontura(id_montura);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeMontura.length > 0) {
        try {
            //Primero actualizo datos de la tabla cliente
            const paramsMontura = {
                TableName: TABLE_NAME_MONTURAS,
                Key: {
                    "id_montura":id_montura,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const montura = await dynamoClient.update(paramsMontura).promise();      
            res.json(montura);
            return montura;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('no existe')
        return res.status(500).json({
            message:'El usuario no existe'
        })
    }
};
/*
    1.-  Funcion para editar una montura en especifico  
    2.-  Antes de editar la montura, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const editMonturaById = async (req, res) => {
    const id_montura = req.params.idMontura;
    const {cantidad,codigo,fecha_modificacion_monturas,
            marca, material, precio_montura_c,precio_montura_v, talla} = req.body;
    // Valido si existe en la BD el idmontura enviado desde el front
    const existeMontura = await validateMontura(id_montura);
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