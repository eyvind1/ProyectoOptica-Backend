import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();


// Log to con

/* Esta funcion lista todas las sedes que se encuentran con "estado = Habikitado" */

export const getProductBySede = async (req, res) => {
    let id_sede      = req.params.idSede;
    let product_name = req.params.productName;
    try{
        const params = {
            TableName: product_name,
            FilterExpression : "#habilitado = :valueHabilitado and #idsede =:idsede",
            ExpressionAttributeValues: {
                ":valueHabilitado": true,
                ":idsede": id_sede
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#idsede": "id_sede"
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