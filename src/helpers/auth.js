
/* Creando un middleware, es decir las rutas primero pasan este filtro */
export const isUserAuthenticated = (req,res,next) => {
    console.log(req.isAuthenticated())
    /*if (req.isAuthenticated()) {
        return next();
    } else {
        //req.send('error no autenticado')
        req.flash('error', 'No Autorizado');
        return res.status(500).json({
            message:'No has iniciado sesion'
        })
    }*/

}
