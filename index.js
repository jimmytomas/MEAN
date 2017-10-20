'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;

mongoose.connect('mongodb://localhost:27017/curso_mean2', { useMongoClient: true }, (err,res) => {
    if(err){
        throw err;
    }else{
        console.log("Connnection successful!");

        app.listen(port, function(){
            console.log("Server from API is listening on http://localhost:"+port);
        })
    }
});