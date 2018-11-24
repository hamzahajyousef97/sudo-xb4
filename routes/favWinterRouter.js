const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const FavoriteWinters = require('../models/favoriteWinter');
const favWinterRouter = express.Router();
favWinterRouter.use(bodyParser.json());


favWinterRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req,res,next) => {
    FavoriteWinters.findOne({ user: req.user._id})
    .populate('user')
    .populate('winters')
    .exec((err, favWinter) => {
        if (err) {
            return next(err);
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favWinter);
        }
    });
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('POST operation not supported on /favoriteWinter');
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favoriteWinter');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteWinters.findOneAndRemove({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



favWinterRouter.route('/:winterId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    FavoriteWinters.findOne({ user: req.user._id})
    .populate('user')
    .then((favWinter) => {
        if (!favWinter) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favWinters": favWinter});
        }
        else {
            if (favWinter.winters.indexOf(req.params.winterId) < 0 ) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favWinters": favWinter});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favWinters": favWinter});
            }
        }   
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteWinters.findOne({ user: req.user._id }, (err, favWinter) => {
        if (err) {
            return next(err);
        }
        if (!favWinter) {
            FavoriteWinters.create({ user: req.user._id })
            .then((favWinter) => {
                favWinter.winters.push({ "_id": req.params.winterId })
                favWinter.save()
                .then((favWinter) => {
                    console.log('favWinter created', favWinter);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favWinter);
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            });
        }
        else {
            if (favWinter.winters.indexOf(req.params.winterId) < 0 ) {
                favWinter.winters.push({ "_id": req.params.winterId })
                favWinter.save()
                .then((favWinter) => {
                    console.log('favWinter Added!');
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favWinter);
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Winter '+ req.params.winterId + ' already exists in your favWinter');
            }
        }
    });
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favoriteWinters/' + req.params.winterId);
})


.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteWinters.findOne({ user: req.user._id }, (err, favWinter) => {
        if (err) {
            return next(err);
        }
        var index = favWinter.winters.indexOf(req.params.winterId);
        if (index >= 0 ) {
            favWinter.winters.splice(index,1);   
            favWinter.save()
            .then((favWinter) => {
                FavoriteWinters.findById(favWinter._id)
                .populate('user')
                .populate('winters')
                .then((favWinter) => {
                    console.log('Your favWinter Deleted!', favWinter);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favWinter);
                })
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Winter {'+ req.params.winterId + '} not in your favWinter');
        }
    });
});

module.exports = favWinterRouter;