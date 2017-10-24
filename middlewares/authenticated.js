'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'clave_secreta_curso';

function ensureAuth(req, res, next){
    if(!req.headers.authorization){
        return res.status(403).send({ message: 'No Authorization header found.'})
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        var payload = jwt.decode(token, secret);

        if(payload.exp <= moment().unix()){
            return res.status(401).send({ message: 'Token already expired.'})    
        }

    }catch(e){
        console.log(e);
        return res.status(403).send({ message: 'Invalid Token.'})
    }

    req.user = payload;

    next();
};

module.exports = {
    ensureAuth
}