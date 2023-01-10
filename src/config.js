import {config} from 'dotenv'
//Funcion propia de dotenv, para poder leer variables de entorno

config();
//process es un objeto global de node, env almacena todas las variables de mi pc    

//Credenciales importantes de DynamoDB

//export const region= process.env.AWS_DEFAULT_REGION;
export const region          = 'us-east-1';
//export const accessKeyId= process.env.AWS_ACCESS_KEY_Id;
export const accessKeyId     = 'AKIAXPY5GYGIKWGEESVL';

//export const secretAccessKey= process.env.AWS_SECRET_ACCESS_KEY;
export const secretAccessKey ='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';
// Defino el puerto local o sino el 4000 para que corra localmente 
export const PORT            = process.env.PORT ||  '5000';

