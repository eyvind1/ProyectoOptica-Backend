import AWS from '../db.js'

const TABLE_NAME_CLIENTE  = "Clientes";
const dynamoClient        = new AWS.DynamoDB.DocumentClient();


/* Funcion para darle formato de dos digitos al mes, dia y 4 digito al anio ... 01-02-2022*/ 
export function castIsoDateToDate(fecha){
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

/*  Funcion que permite validar Dni solo al momento de crear un usuario 
    1.- Obligatoriamente tiene que verificar solamente sobre usuarios habilitados porque los dados de baja 
        podrian haber tenido el mismo DNI
*/ 
export async function validarDniClientes(dni){
    try {
        const paramsCliente = {
            TableName: TABLE_NAME_CLIENTE,
            FilterExpression:
              'dni = :dni and habilitado = :habilitado' ,
            ExpressionAttributeValues: {
                ":dni"        : dni,
                ":habilitado" : true,
            }
        };
        let result= await dynamoClient.scan(paramsCliente).promise();      
        //Retorno 1 si encuentra y  0 sino encuentra
        return result.Count;
    } catch (error) {
        console.log(error);
        return error;
    }
}