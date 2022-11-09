
import AWS from 'aws-sdk';
//Importo mis credenciales desde mi archivo de configuracion
import {
    region,accessKeyId,secretAccessKey
} from './config.js'

AWS.config.update({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});

export default AWS;