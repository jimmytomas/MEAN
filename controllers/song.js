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

function getSongs(req, res){
    var albumId = req.params.id;

    if(!albumId){
        var find = Song.find({}).sort('number');
    }else{
        var find = Song.findById(albumId).sort('number');
    }

    find.populate({ 
        path: 'album',
        select: 'title',
        populate: {
            path: 'artist',
            select: 'name',
            model: 'Artist'
        }
    }).exec((err, songs) => {
        if(!err){
            if(songs){
                res.status(200).send({ songs });
            }
        }
    })
}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate( songId, update, (err, songUpdated) => {
        if(!err && songUpdated){
            res.status(200).send({ song: songUpdated });
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

function deleteSong(req, res){
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, songDeleted) => {
        if(!err && songDeleted){
            res.status(200).send({ song: songDeleted });
        }
    })
}

function uploadFile(req, res){
    var songId = req.params.id;
    var file_name = 'No uploaded...';

    if(req.files){
        var file_path = req.files.file.path;
        file_name = file_path.split('\\')[2];
        var file_ext = file_name.split('\.')[1];

        if(file_ext.toLowerCase() == 'mp3'){
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error while updating file in DB.'});
                }else{
                    res.status(200).send({ song: songUpdated });
                }
            });
        }else{
            res.status(500).send({ message: 'Extension incorrect.'});
        }
        console.log(file_name+" "+file_ext);
    }else{
        req.status(200).send({ message: 'File was not uploaded.'});
    }
}

function getSongFile(req, res){
    var songFile = req.params.songFile;
    var pathFile = './uploads/songs/'+songFile;
    fs.exists(pathFile, (exist) => {
        if(exist){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({ message: 'File dont exist.'});
        }
    });
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}