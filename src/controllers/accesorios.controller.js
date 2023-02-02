import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';


const TABLE_NAME_ACCESORIO = "Accesorios";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */ 

/* Funcion para darle formato de dos digitos al mes, dia y 4 digito al anio ... 01-02-2022*/ 
function castIsoDateToDate(fecha){
    const date = new Date(fecha);
    //const timestamp = date
    let mes     = (date.getMonth()+1).toString();
    let anio    = date.getFullYear();
    let dia     = date.getDate().toString();
    let hora    = date.getHours().toString();
    if (mes.length < 2) {
        mes = '0' + mes;
    }
    if (dia.length < 2) {
        dia = '0' + dia;
    }
    if (hora.length < 2) {
        hora = '0' + hora;
    }
    const result = (dia+mes+ anio);
    return result;
}

async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(a.num_orden) - new Date(b.num_orden); // ascending order
      })
      return arrayJson
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
                ":valueCantidad": 0,
                ":valueSede": id_sede
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#cantidad": "cantidad",
                "#id_sede":    "id_sede"
            }
        };
        const accesorios = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(accesorios.Items); 
        res.json(rpta);
        
        
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
        const rpta  = await sortArrayJsonByDate(accesorios.Items); 
        res.json(rpta);
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
        const id_accesorio = v4() + codeForTables.tablaAccesorios;
        const {habilitado,num_orden,tipo,nombre_accesorio,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = (req.body);
        
        let formatoFecha   = castIsoDateToDate(fecha_creacion_monturas);
        let codigo_interno = num_orden.toString()+ formatoFecha+prefixesForProducts.ProdAccesorio; 

        const datosAccesorio = {
            id_accesorio,
            tipo,
            num_orden,
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
            Item: datosAccesorio
        }).promise()
        res.json(newAccesorio);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};

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
              'id_accesorio = :id_accesorio',
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

/*
    1.-  Funcion para editar un accesorio en especifico  
    2.-  Antes de editar el accesorio, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const editAccesorioById = async (req, res) => {
    const id_accesorio = req.params.idAccesorio;
    const {nombre_accesorio,cantidad,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = req.body;
    const existeAccesorio = await validateAccesorio(id_accesorio);
    if(existeAccesorio.length > 0) {
        try {
            const paramsAccesorio = {
                TableName: TABLE_NAME_ACCESORIO,
                Key: {
                    "id_accesorio":id_accesorio,
                },
                UpdateExpression: `SET  cantidad= :cantidad, fecha_modificacion_accesorio = :fecha_modificacion_accesorio,
                                        nombre_accesorio=:nombre_accesorio,
                                        precio_accesorio_c=:precio_accesorio_c,precio_accesorio_v=:precio_accesorio_v`,
                ExpressionAttributeValues: {
                    ":cantidad" : cantidad,
                    ":nombre_accesorio" : nombre_accesorio,
                    ":fecha_modificacion_accesorio": fecha_modificacion_accesorio,
                    ":precio_accesorio_c"   : precio_accesorio_c,
                    ":precio_accesorio_v"   : precio_accesorio_v
                }
            };
            const accesorio = await dynamoClient.update(paramsAccesorio).promise();
            res.json(accesorio)
            return accesorio;  
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'No se puede actualizar el accesorio'
            })
        }
    }
    else{
        console.log('No existe el accesorio')
        return res.status(500).json({
            message:'El accesorio no existe'
        })
    }
};
