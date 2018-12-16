const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const summerRouter = express.Router();
summerRouter.use(bodyParser.json());
const multer = require('multer');

const Summers = require('../models/summers');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/summers');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() + file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


summerRouter.route('/upload')
.options(cors.cors, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file.filename);
})

summerRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.find(req.query)
    .populate('comments.author')
    .populate('likes.author')
    .then((summers) => {
//        for (var i = (summers.length -1); i >= 0; i--) {
//            Summers.findByIdAndUpdate(summers[i]._id,
//                { $inc: { views: 1 } },
//                { new: true })
//                .then((summer) => {
//                    summer.save()
//                })
//        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(summers);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, upload.single('imageFile'), (req,res,next) => {
    Summers.create(req.body)
    .then((summer) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(summer);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /summers');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Summers.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



summerRouter.route('/:summerId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.findByIdAndUpdate(req.params.summerId, 
        { $inc: { views: 1 } },
        { new: true })
    .populate('comments.author')
    .populate('likes.author')
    .then((summer) => {
        if(summer != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(summer);
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /summers/' + req.params.summerId);
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Summers.findByIdAndUpdate(req.params.summerId, {
        $set: req.body
    }, { new: true})
    .then((summer) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(summer);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Summers.findByIdAndRemove(req.params.summerId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


summerRouter.route('/:summerId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .populate('comments.author')
    .populate('likes.author')
    .then((summer) => {
        if (summer != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(summer.comments);
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Summers.findByIdAndUpdate(req.params.summerId,
        { $inc: { commentNum: 1 } },
        { new: true })
    .then((summer) => {
        if (summer != null) {
            req.body.author = req.user._id;
            summer.comments.push(req.body);
            summer.save()
            .then((summer) => {
                Summers.findById(summer._id)
                .populate('comments.author')
                .populate('likes.author')
                .then((summer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(summer);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /summers/' + req.params.summerId + '/comments');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .then((summer) => {
        if (summer != null) {
            for (var i = (summer.comments.length -1); i >= 0; i--) {
                summer.comments.id(summer.comments[i]._id).remove();
            }
            summer.save()
            .then((summer) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(summer);
            }, (err) => next(err));
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


summerRouter.route('/:summerId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .populate('comments.author')
    .then((summer) => {
        if (summer != null && summer.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(summer.comments.id(req.params.commentId));
        }
        else if (summer == null) {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /summers/' + req.params.summerId
        + '/comments/' + req.params.commentId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .populate('comments.author')
    .populate('likes.author')
    .then((summer) => {
        if (JSON.stringify(summer.comments.id(req.params.commentId).author._id) == JSON.stringify(req.user._id)) {
            if (summer != null && summer.comments.id(req.params.commentId) != null) {
                if (req.body.rating) {
                    summer.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    summer.comments.id(req.params.commentId).comment = req.body.comment;
                }
                summer.save()
                .then((summer) => {
                    Summers.findById(summer._id)
                    .populate('comments.author')
                    .populate('likes.author')
                    .then((summer) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(summer);
                    })
                }, (err) => next(err));
            }
            else if (summer == null) {
                err = new Error('summer ' + req.params.summerId + ' not found ');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found ');
                err.status = 404;
                return next(err);  
            }
        }
        else {
            var err = new Error('You are not authorized to update this comment!');
            err.status = 403;
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Summers.findByIdAndUpdate(req.params.summerId,
        { $inc: { commentNum: -1 } },
        { new: true })
    .then((summer) => {
        if (req.user.admin === true || summer.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
            if (summer != null && summer.comments.id(req.params.commentId) != null) {
                summer.comments.id(req.params.commentId).remove();
                summer.save()
                .then((summer) => {
                    Summers.findById(summer._id)
                    .populate('comments.author')
                    .populate('likes.author')
                    .then((summer) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(summer);
                    })
                }, (err) => next(err));
            }
            else if (summer == null) {
                err = new Error('summer ' + req.params.summerId + ' not found ');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Comment ' + req.params.commentId + ' not found ');
                err.status = 404;
                return next(err);  
            }
        }
        else {
            var err = new Error('You are not authorized to delete this comment!');
            err.status = 403;
            next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


summerRouter.route('/:summerId/likes')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .populate('likes.author')
    .then((summer) => {
        if (summer != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(summer.likes);
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .then((summer) => {
        if (summer != null) {
            req.body.author = req.user._id;
            summer.likes.push(req.body);
            summer.save()
            .then((summer) => {
                Summers.findById(summer._id)
                .populate('likes.author')
                .then((summer) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(summer);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /summers/' + req.params.summerId + '/likes');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Delete operation not supported on /summers/' + req.params.summerId + '/likes');
});



summerRouter.route('/:summerId/likes/:likeId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .populate('likes.author')
    .then((summer) => {
        if (summer != null && summer.likes.id(req.params.likeId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(summer.likes.id(req.params.likeId));
        }
        else if (summer == null) {
            err = new Error('summer ' + req.params.summerId + ' not found ');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Like ' + req.params.likeId + ' not found ');
            err.status = 404;
            return next(err);  
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /summers/' + req.params.summerId
        + '/likes/' + req.params.likeId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /summers/' + req.params.summerId
        + '/likes/' + req.params.likeId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Summers.findById(req.params.summerId)
    .then((summer) => {
        if(req.user.admin === true || JSON.stringify(summer.likes.id(req.params.likeId).author._id) == JSON.stringify(req.user._id)) {
            if (summer != null && summer.likes.id(req.params.likeId) != null) {
                summer.likes.id(req.params.likeId).remove();
                summer.save()
                .then((summer) => {
                    Summers.findById(summer._id)
                    .populate('likes.author')
                    .then((summer) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(summer);
                    })
                }, (err) => next(err));
            }
            else if (summer == null) {
                err = new Error('summer ' + req.params.summerId + ' not found ');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Like ' + req.params.likeId + ' not found ');
                err.status = 404;
                return next(err);  
            }
        }
        else {
            var err = new Error('You are not authorized to delete this Like!');
            err.status = 403;
            next(err);
        }

    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = summerRouter;

