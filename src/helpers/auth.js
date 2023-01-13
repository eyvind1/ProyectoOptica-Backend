const helpers = {};

/* Creando un middleware, es decir las rutas primero pasan este filtro */
helpers.isAuthenticated = (req,res,next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error', 'No Autorizado');
        res.redirect('/login');
    }

}

export default helpers;