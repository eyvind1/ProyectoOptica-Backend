/* En este file se definen las funciones relacionadas a
  
1.- Autenticacion del usuario
*/
import AWS from '../db.js'
import {v4} from 'uuid';
import passport from 'passport';

/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_USUARIO  = "Usuarios";

//export const signIn = async (req, res) => {

export const signIn =  passport.authenticate("local", {
    
    //res.send('ok')
    //const dynamoClient = new AWS.DynamoDB.DocumentClient();
    //Falta validar como llega el email y passwoord **********************
   // const {email,password} = req.body;
    /*try {
        const params = {
            TableName: TABLE_NAME_MONTURAS,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
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
    }*/
});

