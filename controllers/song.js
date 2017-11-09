'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res){
    var songId = req.params.id;
    
    Song.findById(songId).populate({ path: 'album', select: 'title'}).exec((err, songStored) => {
        if(!err){
            if(songStored){
                res.status(200).send({ songStored });
            }
        }
    });
}

function saveSong(req, res){
    var song = new Song();
    var params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album;

    song.save((err, songStored) =>{
        if(!err){
            if(songStored){
                res.status(200).send({ song: songStored });
            }
        }
    });

}

module.exports = {
    getSong,
    saveSong
}