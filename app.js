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
const passport = require('passport')
require('./config/auth')(passport)
const db =require('./config/db')
const PORT = process.env.PORT || 5050;

//config 
   //sessão
   app.use(session({
      secret: "cursodenode",
      resave: true,
      saveUninitialized: true
   }))
   app.use(passport.initialize())
   app.use(passport.session())
   app.use(flash())
   //Middleware
   app.use((req,res,next)=>{
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error =req.flash('error')
      res.locals.user = req.user || null;
      next()
   })

   //body-parser
   app.use(bodyParser.urlencoded({ extended: true }))
   app.use(bodyParser.json())

   //handlebars
   app.engine('handlebars', handlebars({defaultLayout:'main'}));
   app.set('view engine', 'handlebars');

   //mongoose
   mongoose.connect('mongodb+srv://caiosantos:<caiosantos>@cluster0-4kq1d.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true,useUnifiedTopology: true});

   //public
   app.use(express.static(path.join(__dirname,"public")))

   //rotas
    app.use('/admin',admin)
    app.use('/user',user)
    //redirecionar para a pagina de usuario
    app.get('/',(req,res)=>{
       res.redirect('/user/')
    })


 //outros
app.listen(PORT,()=>console.log('Servidor rodando na porta '+PORT))