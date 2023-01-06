export const helpers = {};


/* Creando un middleware, es decir las rutas primero pasan este filtro */
helpers.isAuthenticated = (req,res,next) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'No Autorizado');
        return next();
    } else {
        res.redirect('/login');
    }

}
