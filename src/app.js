import express from 'express';
import clientsRoutes from './routes/clients.routes.js';
import usersRoutes from   './routes/users.router.js';
import cors from 'cors'

const app = express();
app.use(cors());
//Paso esta funcion para que express entienda cuando se le envia un Json
app.use(express.json());

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


app.use(clientsRoutes);
app.use(usersRoutes);


export default app;