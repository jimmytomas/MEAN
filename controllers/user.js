'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');

function pruebas(req, res){
    res.status(200).send({
        message: "Testing action in controller users"
    })
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    user.name = params.name;
    user.surname = params.surname; 
    user.email = params.email;
    user.role = 'ROLE_USER';
    user.image = 'null';

    if(params.password){
        bcrypt.hash(params.password,null,null,function(err, hash ){
            if(err){
                res.status(500).send({
                    message: 'Error while encrypting password.'
                })
            }else{
                user.password = hash;
                if(user.name != null && user.surname != null && user.email != null){
                    user.save((err, userStored) => {
                        if(err){
                            res.status(500).send({
                                message: 'Error when saving user.'
                            });
                        }else{
                            if(!userStored){
                                res.status(500).send({
                                    message: 'Error when saving.'
                                }); 
                            }else{
                                res.status(200).send({
                                    user: userStored
                                })
                            }
                        }
                    });
                }else{
                    res.status(200).send({
                        message: 'Fill all fields.'
                    });
                }
            }
        });
    }else{
        res.status(200).send({
            message: 'Introduce password.'
        });
    }
}

function loginUser(req, res){
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email.toLowerCase()}, (err, user) => {
        if(err){
            res.status(500).send({ message: 'Error in petition.' });
        }else{
            if(!user){
                res.status(404).send({message: 'User dont exist.' })
            }else{
                // Compare password
                bcrypt.compare(password, user.password, (err, check) => {
                    if(check){
                        if(params.gethash){

                        }else{
                            console.log(user);
                            res.status(200).send({ user })
                        }
                    }else{
                        res.status(404).send({ message: 'User unable to login.' })
                    }
                })
            }
        }
    })
}

module.exports = {
    pruebas,
    saveUser,
    loginUser
};