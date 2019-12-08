if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI:"mongodb+srv://caiosantos:caiosantos@cluster0-4kq1d.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports ={mongoURI: 'mongodb://localhost/blog'}
}