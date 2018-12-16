const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const feedbackRouter = express.Router();
feedbackRouter.use(bodyParser.json());

const Feedback = require('../models/feedback');

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedback.find(req.query)
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, (req,res,next) => {
    Feedback.create(req.body)
    .then((feedback) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /feedbacks');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedback.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



feedbackRouter.route('/:feedbackId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedback.findById(req.params.feedbackId)
    .then((feedback) => {
        if(feedback != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(feedback);
        }
        else {
            err = new Error('feedback ' + req.params.feedbackId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /feedbacks/' + req.params.feedbackId);
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /feedbacks/' + req.params.feedbackId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedback.findByIdAndRemove(req.params.feedbackId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = feedbackRouter;

