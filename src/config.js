import {config} from 'dotenv'
//Funcion propia de dotenv, para poder leer variables de entorno

config();
//process es un objeto global de node, env almacena todas las variables de mi pc    

//export const region= process.env.AWS_DEFAULT_REGION;
export const region          = 'us-east-1';
// Defino el puerto local o sino el 4000 para que corra localmente 
export const PORT            = process.env.PORT ||  '5000';

