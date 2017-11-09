'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res){
    var albumId = req.params.id;
    Album.findById(albumId).populate( { path: 'artist' }).exec((err, album) => {
        if(!err){
            if(album){
                res.status(200).send({ album });
            }
        }
    });
}

function getAlbums(req, res){
    var artistId = req.params.id;
    if(!artistId){
        var find = Album.find({}).sort('title');
    }else{
        var find = Album.find({artist: artistId}).sort('year');
    }
    find.populate({path: 'artist'}).exec((err, albums) =>{
        if(!err){
            if(albums){
                res.status(200).send({albums});
            }
        }
    });
}

function saveAlbum(req, res){
    var album = new Album();

    var params = req.body;
    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if(!err){
            if(albumStored){
                res.status(200).send({ album: albumStored });
            }
        }
    });
}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) => {
        if(!err){
            if(albumUpdated){
                res.status(200).send({ album: albumUpdated });
            }
        }
    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;

    Album.findByIdAndRemove( albumId, (err, albumRemoved) => {
        if(!err){
            if(albumRemoved){
                Song.find({ album: albumId }).remove( (err, songRemoved) => {
                    if(!err){
                        if(songRemoved){
                            res.status(200).send({ album: albumRemoved });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    var albumId = req.params.id;
    var file_name = 'No uploaded...';

    if(req.files){
        var file_path = req.files.image.path;
        file_name = file_path.split('\\')[2];
        var file_ext = file_name.split('\.')[1];

        if(file_ext.toLowerCase() == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            Album.findByIdAndUpdate(albumId, {image: file_name}, (err, albumUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error while updating file in DB.'});
                }else{
                    res.status(200).send({ album: albumUpdated });
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
    var pathFile = './uploads/albums/'+imageFile;
    fs.exists(pathFile, (exist) => {
        if(exist){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({ message: 'Image dont exist.'});
        }
    });
}

module.exports = {
    getAlbum,
    getAlbums,
    saveAlbum,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}