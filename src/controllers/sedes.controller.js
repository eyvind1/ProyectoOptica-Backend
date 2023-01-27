import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_SEDE  = "Sedes";

/* Esta funcion lista todas las sedes que se encuentran con "estado = Habikitado" */
export const getAllSedes = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_SEDE,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado": true
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
export const createNewSede = async (req, res) => {
    try {
        // Concateno el id_sede + su codigo especificado en el archivo util "CodigosTablas.js"
        const id_sede = v4() + codeForTables.tablaSedes;
        const {habilitado,direccion,fecha_modificacion_sede,fecha_creacion_sede,nombre_sede} = (req.body);
        const datosSede = {
            id_sede,
            habilitado,
            direccion,
            fecha_creacion_sede,
            fecha_modificacion_sede,
            nombre_sede
        }
        const newSede = await dynamoClient.put({
            TableName: TABLE_NAME_SEDE,
            Item: datosSede
        }).promise()
        res.json(newSede);       
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};


const validateSede  = async (idSede) => {
    const id_sede   = idSede;
    try {
        const paramsSede = {
            TableName: TABLE_NAME_SEDE,
            KeyConditionExpression:
              'id_sede = :id_sede',
            ExpressionAttributeValues: {
                ":id_sede": id_sede
            }
        };
        const sede  = await dynamoClient.query(paramsSede).promise();      
        return sede.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}
/*
    1.-  Funcion para Dar de Baja a una Sede en especifico  
    2.-  Antes de dar de baja a un accesorio valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeSedeById = async (req, res) => {
    const id_sede = req.params.idSede;
    const existeSede = await validateSede(id_sede);
    if(existeSede.length > 0) {
        try {
            const paramsSede = {
                TableName: TABLE_NAME_SEDE,
                Key: {
                    "id_sede":id_sede,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const sede = await dynamoClient.update(paramsSede).promise();      
            res.json(sede);
            return sede;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('no existe la sede')
        return res.status(500).json({
            message:'La sede no existe'
        })
    }
};


export const editSedeById = async (req, res) => {
    
    const id_sede = req.params.idSede;
    const {direccion,nombre_sede,fecha_modificacion_sede} = req.body;
    try {
        const paramsSede = {
            TableName: TABLE_NAME_SEDE,
            Key: {
                "id_sede":id_sede,
            },
            UpdateExpression: `SET  direccion= :direccion, nombre_sede=:nombre_sede, fecha_modificacion_sede = :fecha_modificacion_sede`,
            ExpressionAttributeValues: {
                ":direccion"   : direccion,
                ":nombre_sede" : nombre_sede,
                ":fecha_modificacion_sede": fecha_modificacion_sede,
            }
        };
        const sede = await dynamoClient.update(paramsSede).promise();
        res.json(sede)
        return sede;  
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:'No se puede actualizar la Sede'
        })
    }
   
};