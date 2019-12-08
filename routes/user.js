const express = require('express')
const router = express.Router()
const mongoose = require('mongoose') //carrega o modulo monggose
require("../models/produto") // importa a tabela produto da pasta models
require("../models/carrrinho")
require("../models/usuario")
const Produto = mongoose.model("produtos") // atribui a constante produto a tabela produtos
const Carrinho = mongoose.model("carrinho")
const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs')
const passport = require('passport')

// ROTAS DE LOGIN

//formulario registro
router.get('/registro',(req,res)=>{
    res.render('usuarios/registro')
})

router.post('/registro',(req,res)=>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Invalido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email Invalido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha Invalida"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "A senha deve ter pelo menos 4 caracteres"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas são diferentes"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro",{erros:erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash("error_msg","Já existe um conta com esse email no nosso sistema")
                res.redirect("/user/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha 
                })

                // hacheando a senha
                bcrypt.genSalt(10,(erro,salt)=>{
                    bcrypt.hash(novoUsuario.senha,salt,(errro,hash)=>{
                        if(erro){
                            req.flash("error_msg","Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                        //atribuindo a senha hasheada
                        novoUsuario.senha = hash

                        novoUsuario.save().then(()=>{
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("/")
                        }).catch((erro)=>{
                            req.flash("error_msg","Houve um erro ao criar o usuario, tente novamente")
                            res.redirect('/user/registro')
                        })
                    })
                })


            }
        }).catch((erro)=>{
            req.flash("erros_msg","Houve um erro interno")
            res.redirect("/")
        })
    }

})

//formulario de login
router.get('/login',(req,res)=>{
    res.render('usuarios/login')
})

router.post('/login',(req,res,next)=>{

    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req,res,next)
})


// Ver produtos da loja
router.get('/loja', (req, res) => {
    Produto.find().sort({ date: 'desc' }).then((produtos) => {
        res.render('user/loja', { produtos: produtos })
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro")
        res.redirect('/user')
    })
})

router.get('/logout',(req,res)=>{

    req.logOut()
    req.flash('success_msg',"Deslogado com sucesso!")
    res.redirect('/user/loja')
    
})


// ROTAS DA LOJA

//Ver produtos do carrinho
router.get('/carrinho', (req, res) => {
    Carrinho.find().sort({ date: 'desc' }).then((produtos) => {
        res.render('user/carrinho', { produtos: produtos })
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro")
        res.redirect('/user')
    })
})

router.get('/loja/add', (req, res) => {
    res.render('admin/addprodutos')
})


//formulario de compra
router.get('/loja/add/:id', (req, res) => {
    Produto.findOne({ _id: req.params.id }).then((produto) => {

        res.render('user/add', { produto: produto })
    }).catch((erro) => {
        req.flash("error_msg", 'Esse produto não existe')
        res.redirect('/user/loja')
    })
})

//adicionar no carrinho
router.post('/loja/add', (req, res) => {
    Produto.findOne({ _id: req.body.id }).then((produto) => {
        var quantidade = produto.quantidade
        produto.quantidade = quantidade - req.body.quantidade
        var erros = [];
        const novoProduto = {
            nome: produto.nome,
            quantidade: req.body.quantidade,
            preco: produto.preco * req.body.quantidade
        }

        if (!req.body.quantidade || typeof req.body.quantidade == undefined || req.body.quantidade == null || req.body.quantidade <= 0) {
            erros.push({ texto: "Insira uma quantidade maior que 0" })
        }

        if (quantidade == 0) {
            erros.push({ texto: `Não temos o produto selecionado no estoque` })
        }
        if (req.body.quantidade > quantidade) {
            erros.push({ texto: `No momento temos ${quantidade} no estoque` })
        }

        if (req.body.quantidade.length <= 0) {
            erros.push({ texto: "Insira a quantidade que deseja add" })
        }

        if (erros.length > 0) {
            res.render("user/add", { erros: erros })

        } else {
            //adiciona o produto ao carrinho
            new Carrinho(novoProduto).save()
            //atualiza o estoque
            produto.save().then(() => {
                req.flash('success_msg', `${produto.nome} adionado(a) ao carrinho`)
                res.redirect('/user/loja')
            }).catch((erro) => {
                req.flash('error_msg', "Erro ao add o produto")
                res.redirect('/user/loja')
            })
        }
       
    }).catch((erro) => {
        req.flash('error_msg', "Houve um erro ao adicionar o produto")
        res.redirect('/user/loja')
    })
})

//delete
router.post('/carrinho/deletar',(req,res)=>{
    Carrinho.remove({_id:req.body.id}).then(()=>{
        req.flash('success_msg', "Parabéns compra efetuada com sucesso")
        res.redirect('/user/carrinho')
    }).catch((erro)=>{
        req.flash('error_msg','Erro ao efetuar a compra tente novamente')
        res.redirect('/user/carrinho')
    })
})

module.exports = router