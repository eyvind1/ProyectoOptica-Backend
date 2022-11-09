import AWS from '../db.js'

export const createNewUser = async (req, res) => {
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    const TABLE_NAME = "Usuarios";

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