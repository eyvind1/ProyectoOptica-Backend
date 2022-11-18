import AWS from '../db.js'
import {v4} from 'uuid';

/*  Esta funcion primero crea una persona, luego crea al usuario
    y lo enlaza insertando el mismo id_persona
*/
export const createNewUser = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_PERSONA  = "Persona";
    const TABLE_NAME_USUARIO  = "Usuarios";

    //estado bool
    try {
        const id_persona = v4();
        const id_usuario = v4();

        const {nombres,apellidos,dni,rol,habilitado,fecha_creacion,fecha_modificacion,telefono} = (req.body);
        const newPersona = {
            id_persona,
            apellidos,
            dni,
            fecha_creacion,
            fecha_modificacion,
            nombres,
            telefono
        }
        const newUser = {
            id_usuario,
            habilitado,
            fecha_creacion,
            id_persona,
            rol
        };
        
        console.log(nombres,apellidos,dni,rol,habilitado,fecha_creacion,fecha_modificacion,telefono);
        //Si no le pongo .promise, solo seria un callback
        
        await dynamoClient.put({
            TableName: TABLE_NAME_PERSONA,
            Item: newPersona
        }).promise()

        const createdUser = await dynamoClient.put({
            TableName: TABLE_NAME_USUARIO,
            Item: newUser
        }).promise()
        
        res.json(createdUser);       
        
    } catch (error) {
        return res.status(500).json({ 
            message:'Algo anda mal al crear un Usuario'
        })
    }
};



/* Estea funcion */ 
export const getAllUsers = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_USUARIO  = "Usuarios";
    const TABLE_NAME_PERSONA  = "Persona";
    let result={};
    try {
        /*Primero obtengo el json con todos los usuarios */ 
        const params = {
            TableName: TABLE_NAME_USUARIO
        };
        const usuarios = await dynamoClient.scan(params).promise();
        let arr=[];
        let cont = 0;
        /* Segundo itero sobre cada usuario y obtengo la persona */
        usuarios.Items.map(async function(usuario,i)
        {
            const id_persona = usuario.id_persona
            result = await dynamoClient.get({
                TableName:TABLE_NAME_PERSONA,
                Key:{
                    id_persona
                }
            }).promise()
            result = {...usuario,...result.Item};
            arr.push(result);
            //Count es un atributo propio y devuelto por dinamo
            if(cont==usuarios.Count-1){   
                res.json(arr);
            }
            cont +=1;
        })
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
      }

};


