const express = require('express')
const router = express.Router()
const mongoose = require('mongoose') //carrega o modulo monggose
require("../models/produto") // importa a tabela produto da pasta models
const Produto = mongoose.model("produtos") // atribui a constante produto a tabela produtos

// read
router.get('/produtos',(req,res)=>{
    Produto.find().sort({date:'desc'}).then((produtos)=>{
        res.render('admin/produtos',{produtos:produtos})
    }).catch((erro)=>{
        req.flash("error_msg","Houve um erro")
        res.redirect('/admin')
    })
})

router.get('/produtos/add',(req,res)=>{
    res.render('admin/addprodutos')
})

// create
router.post('/produtos/novo',(req,res)=>{
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined|| req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome do produto muito pequeno"})
    }

    if(!req.body.quantidade || typeof req.body.quantidade == undefined|| req.body.quantidade == null || req.body.quantidade < 0){
        erros.push({texto: "Quantidade invalida"})
    }

    if(!req.body.preco || typeof req.body.preco == undefined|| req.body.preco == null || req.body.preco <= 0){
        erros.push({texto: "Preço invalido"})
    }

    if(erros.length > 0){
        res.render("admin/addprodutos",{erros: erros})
    }else{
        const novoProduto = {
            nome: req.body.nome,
            quantidade: req.body.quantidade,
            preco: req.body.preco
        }
        
        new Produto(novoProduto).save().then(()=>{
            req.flash("success_msg","Produto criado com sucesso")
            res.redirect('/admin/produtos')
        }).catch((err)=>{
            req.flash("error_msg","Falha ao criar o produto")
            res.redirect('/admin/produtos')
        })
    }
})

//update
router.get('/produtos/edit/:id',(req,res)=>{
    Produto.findOne({_id: req.params.id}).then((produto)=> {
        res.render('admin/editprodutos',{produto:produto})
    }).catch((erro)=> {
        req.flash("error_msg",'Esse produto não existe')
        res.redirect('/admin/produtos')
    })
})

router.post('/produtos/edit',(req,res)=>{
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined|| req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome do produto muito pequeno"})
    }

    if(!req.body.quantidade || typeof req.body.quantidade == undefined|| req.body.quantidade == null || req.body.quantidade < 0){
        erros.push({texto: "Quantidade invalida"})
    }

    if(!req.body.preco || typeof req.body.preco == undefined|| req.body.preco == null || req.body.preco <= 0){
        erros.push({texto: "Preço invalido"})
    }

    if(erros.length > 0){
        res.render("admin/editprodutos",{erros: erros})
    }
    
    else{
        Produto.findOne({_id:req.body.id}).then((produto)=>{
            produto.nome =  req.body.nome,
            produto.quantidade = req.body.quantidade
            produto.preco = req.body.preco
    
            produto.save().then(()=>{
                req.flash('success_msg',`${produto.nome} editado(a) com sucesso`)
                res.redirect('/admin/produtos')
            }).catch((erro)=>{
                req.flash('error_msg',"Erro ao editar o produto")
                res.redirect('/admin/produtos')
            })
    
        }).catch((erro)=>{
            req.flash('error_msg',"Houve um erro ao editar o produto")
            res.redirect('/admin/produtos')
        })
    }
})

//delete
router.post('/produtos/deletar',(req,res)=>{
    Produto.remove({_id:req.body.id}).then(()=>{
        req.flash('success_msg', "Produto removido com sucesso")
        res.redirect('/admin/produtos')
    }).catch((erro)=>{
        req.flash('error_msg','Erro ao deletar o produto')
        res.redirect('/admin/produtos')
    })
})

module.exports = router