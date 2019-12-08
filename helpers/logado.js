module.exports ={
    logado: function(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error_msg","Voce precisa estar logado para acessar a pagina de carrinho")
        res.redirect('/user/login')
    }
}