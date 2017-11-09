'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getArtist(req, res){
    var artistId = req.params.id;

    Artist.findById(artistId, (err, artist) => {
        if(err){
            res.status(500).send({ message: 'Error in petition' });
        }else{
            if(!artist){
                res.status(404).send({ message: 'Artist not found.' });
            }else{
                res.status(200).send({ artist });
            }
        }
    });
}

function saveArtist(req, res){
     var artist = new Artist();
     
     var params = req.body;

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if(err){
            res.status(500).send({ message: 'Error when saving artist' });
        }else{
            if(!artistStored){
                res.status(404).send({ message: 'Artist was not saved' });
            }else{
                res.status(200).send({ artist: artistStored  });
            }
        }
    });
}

function getArtists(req, res){
    if(req.params.page)
        var page = req.params.page;
    else
        var page = 1;
    var itemsPerPage = 3;

    Artist.find().sort('name').paginate(page,itemsPerPage,(err,artists,total) => {
        if(err){
            res.status(500).send({ message: 'Error in petition' });
        }else{
            if(!artists){
                res.status(404).send({ message: 'No artists found.' });
            }else{
                return res.status(200).send({
                    total_items: total,
                    artists: artists
                })
            }
        }
    })
}

function updateArtist(req, res){
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if(!err){
            if(artistUpdated){
                res.status(200).send({ artist: artistUpdated });
            }
        }
    });
}

function deleteArtist(req, res){
    var artistId = req.params.id;

    Artist.findByIdAndRemove(artistId,(err, artistRemoved) => {
        if(!err){
            if(artistRemoved){                
                Album.find({ artist: artistRemoved._id}).remove((err, albumRemoved) => {
                    if(!err){
                        if(albumRemoved){
                            Song.find({ album: albumRemoved._id}).remove((err, songRemoved) => {
                                if(!err){
                                    if(songRemoved){
                                        res.status(200).send({ artistRemoved: artistRemoved});
                                    }
                                }
                            })
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res){
    var artistId = req.params.id;
    var file_name = 'No uploaded...';

    if(req.files){
        var file_path = req.files.image.path;
        file_name = file_path.split('\\')[2];
        var file_ext = file_name.split('\.')[1];

        if(file_ext.toLowerCase() == 'png' || file_ext == 'jpg' || file_ext == 'gif'){
            Artist.findByIdAndUpdate(artistId, {image: file_name}, (err, artistUpdated) => {
                if(err){
                    res.status(500).send({ message: 'Error while updating file in DB.'});
                }else{
                    res.status(200).send({ artist: artistUpdated });
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
    var pathFile = './uploads/artists/'+imageFile;
    fs.exists(pathFile, (exist) => {
        if(exist){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(200).send({ message: 'Image dont exist.'});
        }
    });
}

module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}
