/* En este file se definen las funciones relacionadas a
  
1.- Autenticacion del usuario
*/
import AWS from '../db.js';
import {v4} from 'uuid';
import passport from 'passport';                                                                    
/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import {codeForTables} from '../utils/codigosTablas.js';
/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient        = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_USUARIO  = "Usuarios";



export const signIn = passport.authenticate("local", {
    successRedirect: "/notes",
    failureRedirect: "/auth/signin",
    failureFlash: true,
  });

// export const signIn = async (req, res,next) => {
//     console.log('xd')
//     passport.authenticate('local', function(err, user, info) {
//         console.log('entrnado autenticar')
//         if (err) { return next(err); }
//         //if (!user) { return res.redirect('/'); }
    
//         // req / res held in closure
//         /* req.logIn(user, function(err) {
//           if (err) { return next(err); }
//           return res.send(user);
//         });*/
    
//       });
// }




