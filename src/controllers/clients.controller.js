import AWS from '../db.js'

export const getAllClients = async (req, res) => {
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