const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const FavoriteSummers = require('../models/favoriteSummer');
const favSummerRouter = express.Router();
favSummerRouter.use(bodyParser.json());


favSummerRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req,res,next) => {
    FavoriteSummers.findOne({ user: req.user._id})
    .populate('user')
    .populate('summers')
    .exec((err, favSummer) => {
        if (err) {
            return next(err);
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favSummer);
        }
    });
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('POST operation not supported on /favoriteSummer');
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favoriteSummer');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteSummers.findOneAndRemove({ user: req.user._id })
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



favSummerRouter.route('/:summerId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    FavoriteSummers.findOne({ user: req.user._id})
    .populate('user')
    .then((favSummer) => {
        if (!favSummer) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favSummers": favSummer});
        }
        else {
            if (favSummer.summers.indexOf(req.params.summerId) < 0 ) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favSummers": favSummer});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favSummers": favSummer});
            }
        }   
    }, (err) => next(err))
    .catch((err) => next(err))
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteSummers.findOne({ user: req.user._id }, (err, favSummer) => {
        if (err) {
            return next(err);
        }
        if (!favSummer) {
            FavoriteSummers.create({ user: req.user._id })
            .then((favSummer) => {
                favSummer.summers.push({ "_id": req.params.summerId })
                favSummer.save()
                .then((favSummer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favSummer);
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
            if (favSummer.summers.indexOf(req.params.summerId) < 0 ) {
                favSummer.summers.push({ "_id": req.params.summerId })
                favSummer.save()
                .then((favSummer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favSummer);
                })
                .catch((err) => {
                    return next(err);
                });
            }
            else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Summer '+ req.params.summerId + ' already exists in your favSummer');
            }
        }
    });
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favoriteSummers/' + req.params.summerId);
})


.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    FavoriteSummers.findOne({ user: req.user._id }, (err, favSummer) => {
        if (err) {
            return next(err);
        }
        var index = favSummer.summers.indexOf(req.params.summerId);
        if (index >= 0 ) {
            favSummer.summers.splice(index,1);   
            favSummer.save()
            .then((favSummer) => {
                FavoriteSummers.findById(favSummer._id)
                .populate('user')
                .populate('summers')
                .then((favSummer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favSummer);
                })
            })
            .catch((err) => {
                return next(err);
            })
        }
        else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Summer {'+ req.params.summerId + '} not in your favSummer');
        }
    });
});

module.exports = favSummerRouter;
