//carregando modulos
const express = require('express');
const bodyParser = require('body-parser')
const handlebars  = require('express-handlebars');
const admin = require('./routes/admin');
const user = require('./routes/user');
const mongoose = require('mongoose');
const app = express();
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const PORT = 5050;

//config 
   //sessão
   app.use(session({
      secret: "cursodenode",
      resave: true,
      saveUninitialized: true
   }))
   app.use(flash())

   //Middleware
   app.use((req,res,next)=>{
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      next()
   })

   //body-parser
   app.use(bodyParser.urlencoded({ extended: true }))
   app.use(bodyParser.json())

   //handlebars
   app.engine('handlebars', handlebars({defaultLayout:'main'}));
   app.set('view engine', 'handlebars');

   //mongoose
   mongoose.connect('mongodb://localhost/blog', {useNewUrlParser: true,useUnifiedTopology: true});

   //public
   app.use(express.static(path.join(__dirname,"public")))

 //rotas
    app.use('/admin',admin)
    app.use('/user',user)

 //outros
app.listen(PORT,()=>console.log('Servidor rodando na porta '+PORT))