
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
        res.send('ok')

        return characters;  
        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};
export const getAllClientsById = async (req, res) => {
    try {
        const id_param = req.params.id;
        console.log('desde la funcion cliente by id: ', id_param);
        res.send(id_param)

        
    } catch (error) {
        return res.status(500).json({
            message:'Algo anda mal'
        })
        
    }
};
