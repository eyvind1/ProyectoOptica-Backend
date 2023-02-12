/* Librerias propias de Node */
import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser';
import passport from 'passport';
/* Fin Librerias propias de Node */

/* Libreria para el deploy, permite comprimir archivos y reducir carga*/
import compression from 'compression';

/* Importando las rutas creadas */
import clientsRoutes from './routes/clients.routes.js';
import usersRoutes from   './routes/users.router.js';
import monturasRoutes from './routes/monturas.routes.js';
import accesoriosRoutes from './routes/accesorios.routes.js';
import lunasRoutes from './routes/lunas.routes.js';
import sedesRoutes from './routes/sedes.routes.js';
import ventasRoutes from './routes/ventas.routes.js';
import productosRoutes from './routes/productos.routes.js';
import cajaRoutes from './routes/caja.routes.js';
import authRoutes from './routes/auth.routes.js';
/* Fin Importando rutas creadas */

/* Inicializociones para login */
import flash from "flash";
import { JwtStrategy } from './config/passport.js';

const app = express();
app.use(cors());
//Paso esta funcion para que express entienda cuando se le envia un Json, limit sirve para evitar el error too large (413)
app.use(express.json({limit: '50mb'}));

/* *********** MUY IMPORTANTE DEFINIRLO ANTES DE LLAMAR A LAS RUTAS PARA HABILITAR EL CORS */
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

/*Utilizando la compresion*/
app.use(compression);

/* Inicializando la libreria passport para autenticacion */
passport.use(JwtStrategy);
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(flash()); // use connect-flash for flash messages stored in session

/*  Se le indica al servidor que quiero utilizar  todas las rutas que contiene el archivo */ 
app.use(clientsRoutes);
app.use(usersRoutes);
app.use(monturasRoutes);
app.use(lunasRoutes);
app.use(accesoriosRoutes);
app.use(sedesRoutes);
app.use(ventasRoutes);
app.use(productosRoutes);
app.use(cajaRoutes);
app.use(authRoutes);



/* Fin  Se le indica al servidor que quiero utilizar  todas las rutas que contiene el archivo */ 



/* Fin inicializando la libreria passport para autenticacion  */


export default app; 