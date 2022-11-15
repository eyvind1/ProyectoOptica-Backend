import AWS from '../db.js'
import {v4} from 'uuid';


export const getAllClients = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME = "Clientes";

    try {
        console.log('entro')
        const params = {
            TableName: TABLE_NAME
        };
        const characters = await dynamoClient.scan(params).promise();
        console.log(characters);
        res.json(characters)

        return characters;  
        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};

export const editClientById = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME = "Persona";

    try {
        console.log('entro')
        const params = {
            TableName: TABLE_NAME
        };
        const characters = await dynamoClient.scan(params).promise();
        console.log(characters);
        res.json(characters)

        return characters;  
        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};

//Fecha_creacion, fecha_modificacion 
export const getAllClientsById = async (req, res) => {
    try {
        // Create the DynamoDB service object
        var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

        var params = {
        TableName: 'Persona',
        Item: {
            'id_persona' : {S: '001'},
            'apellidos' : {S: 'Richard Roe'}
            }
        };

        // Call DynamoDB to add the item to the table
        ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err);
            res.send('error')
        } else {
            console.log("Success", data);
            res.send('persona insertada')
        }
        });
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};

/*
OJO ESTA FUNCION ESTA FUNCIONANDO, PERO FALTA VALIDAR LOS CAMPOS CON EL FRONT, NADA MAS
RECALCAR QUE EL CAMPO MEDIDA ES UNA LISTA DE OBJETOS
*/ 

export const createNewClient = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME_PERSONA  = "Persona";
    const TABLE_NAME_CLIENTE  = "Clientes";

    //estado bool
    try {
        const id_persona = v4();
        const id_cliente = v4();

        const medidas = [
            {
                "oi_clindrico": -2.5,
                "od_eje": 15,
                "oi_esferico": -1,
                " add": 3.5,
                "od_cilindrico": -2.5,
                "oi_eje": 15,
                "encargado": "DR RIDER",
                "dip": 66,
                "od_esferico": -1
            }
        ];
        const {nombres,apellidos,dni,fecha_creacion,fecha_modificacion,telefono} = (req.body);
        const newPersona = {
            id_persona,
            apellidos,
            dni,
            fecha_creacion,
            fecha_modificacion,
            nombres,
            telefono
        }
        const lentes = 'otro lente pe ';

        const newCliente = {
            id_cliente,
            id_persona,
            lentes,
            medidas
        }; 
        
        await dynamoClient.put({
            TableName: TABLE_NAME_PERSONA,
            Item: newPersona
        }).promise()
        
        const createdClient = await dynamoClient.put({
            TableName: TABLE_NAME_CLIENTE,
            Item: newCliente
        }).promise()
        res.json(createdClient);       
        
    } catch (error) {
        return res.status(500).json({ 
            message:error
        })
    }
};