'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

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
                            res.status(200).send({ token: jwt.createToken(user)});
                        }else{
                            res.status(200).send({ user })
                        }
                    }else{
                        res.status(404).send({ message: 'User unable to login.' })
                    }
                })
            }
        }
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if(err){
            res.status(500).send({ message: 'Error when updating user.'});
        }else{
            if(!userUpdated){
                res.status(404).send({ message: 'User was unable to update.'});
            }else{
                res.status(200).send({ user: userUpdated });
            }
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No upload...';

    if(req.files){
        var file_path = req.files.image.path;
        file_name = file_path.split('\\')[2];
        var file_ext = file_name.split('\.')[1];

        if(file_ext.toLowerCase() == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            User.findByIdAndUpdate(userId, {image: file_name}, (err, userUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error while updating file in DB.'});
                }else{
                    res.status(200).send({ user: userUpdated });
                }
            });
        }else{
            res.status(500).send({ message: 'Extension incorrect.'});
        }

        console.log(file_name+" "+file_ext);
    }else{
        req.status(200).send({ message: 'Image was not uploaded.'});
    }
}

function getImageFile(req, res){
    var imageFile = req.params.imageFile;
    var pathFile = './uploads/users/'+imageFile;
    fs.exists(pathFile, (exist) => {
        if(exist){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({ message: 'Image dont exist.'});
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};