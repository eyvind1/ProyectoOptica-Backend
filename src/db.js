import AWS from 'aws-sdk';
//Importo mis credenciales desde mi archivo de configuracion
import { region} from './config.js';

AWS.config.update({
  region: region
});

export default AWS;
