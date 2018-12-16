const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Winters = require('../models/winters');
const winterRouter = express.Router();
winterRouter.use(bodyParser.json());

const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/winters');
    },

    filename: (req, file, cb) => {
        cb(null, Math.random() +file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFileFilter});


winterRouter.route('/upload')
.options(cors.cors, (req, res) => { res.sendStatus(200); })
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file.filename);
});


winterRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.find(req.query)
    .populate('comments.author')
    .populate('likes.author')
    .then((winters) => {
//        for (var i = (winters.length -1); i >= 0; i--) {
//            Winters.findByIdAndUpdate(winters[i]._id,
//                { $inc: { views: 1 } },
//                { new: true })
//            .then((winter) => {
//                winter.save()
//            })
//        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(winters);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req,res,next) => {
    Winters.create(req.body)
    .then((winter) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(winter);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /winters');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Winters.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});



winterRouter.route('/:winterId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.findByIdAndUpdate(req.params.winterId, 
        { $inc: { views: 1 } },
        { new: true })
    .populate('comments.author')
    .populate('likes.author')
    .then((winter) => {
        if (winter != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(winter);
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /winters/' + req.params.winterId);
})

.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Winters.findByIdAndUpdate(req.params.winterId, {
        $set: req.body
    }, { new: true})
    .then((winter) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(winter);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Winters.findByIdAndRemove(req.params.winterId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


winterRouter.route('/:winterId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .populate('comments.author')
    .populate('likes.author')
    .then((winter) => {
        if (winter != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(winter.comments);
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Winters.findByIdAndUpdate(req.params.winterId,
        { $inc: { commentNum: 1 } },
        { new: true })
    .then((winter) => {
        if (winter != null) {
            req.body.author = req.user._id;
            winter.comments.push(req.body);
            winter.save()
            .then((winter) => {
                Winters.findById(winter._id)
                .populate('comments.author')
                .populate('likes.author')
                .then((winter) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(winter);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /winters/' + req.params.winterId + '/comments');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .then((winter) => {
        if (winter != null) {
            for (var i = (winter.comments.length -1); i >= 0; i--) {
                winter.comments.id(winter.comments[i]._id).remove();
            }
            winter.save()
            .then((winter) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(winter);
            }, (err) => next(err));
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});



winterRouter.route('/:winterId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .populate('comments.author')
    .then((winter) => {
        if (winter != null && winter.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(winter.comments.id(req.params.commentId));
        }
        else if (winter == null) {
            err = new Error('winter ' + req.params.winterId + ' not found ');
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
    res.end('POST operation not supported on /winters/' + req.params.winterId
        + '/comments/' + req.params.commentId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .populate('comments.author')
    .populate('likes.author')
    .then((winter) => {
        if (JSON.stringify(winter.comments.id(req.params.commentId).author._id) == JSON.stringify(req.user._id)) {
            if (winter != null && winter.comments.id(req.params.commentId) != null) {
                if (req.body.rating) {
                    winter.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if (req.body.comment) {
                    winter.comments.id(req.params.commentId).comment = req.body.comment;
                }
                winter.save()
                .then((winter) => {
                    Winters.findById(winter._id)
                    .populate('comments.author')
                    .populate('likes.author')
                    .then((winter) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(winter);
                    })
                }, (err) => next(err));
            }
            else if (winter == null) {
                err = new Error('winter ' + req.params.winterId + ' not found ');
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
    Winters.findByIdAndUpdate(req.params.winterId,
        { $inc: { commentNum: -1 } },
        { new: true })
    .then((winter) => {
        console.log(JSON.stringify(winter.comments.id(req.params.commentId).author._id) + " hamza "   +  JSON.stringify(req.user._id));
        if (req.user.admin === true || winter.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
            if (winter != null && winter.comments.id(req.params.commentId) != null) {
                winter.comments.id(req.params.commentId).remove();
                winter.save()
                .then((winter) => {
                    Winters.findById(winter._id)
                    .populate('comments.author')
                    .populate('likes.author')
                    .then((winter) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(winter);
                    })
                }, (err) => next(err));
            }
            else if (winter == null) {
                err = new Error('winter ' + req.params.winterId + ' not found ');
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


winterRouter.route('/:winterId/likes')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .populate('likes.author')
    .then((winter) => {
        if (winter != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(winter.likes);
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .then((winter) => {
        if (winter != null) {
            req.body.author = req.user._id;
            winter.likes.push(req.body);
            winter.save()
            .then((winter) => {
                Winters.findById(winter._id)
                .populate('likes.author')
                .then((winter) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(winter);
                })
            }, (err) => next(err));
        }
        else {
            err = new Error('winter ' + req.params.winterId + ' not found ');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /winters/' + req.params.winterId + '/likes');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('Delete operation not supported on /winters/' + req.params.winterId + '/likes');
});



winterRouter.route('/:winterId/likes/:likeId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .populate('likes.author')
    .then((winter) => {
        if (winter != null && winter.likes.id(req.params.likeId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(winter.likes.id(req.params.likeId));
        }
        else if (winter == null) {
            err = new Error('winter ' + req.params.winterId + ' not found ');
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
    res.end('POST operation not supported on /winters/' + req.params.winterId
        + '/likes/' + req.params.likeId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('Put operation not supported on /winters/' + req.params.winterId
        + '/likes/' + req.params.likeId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Winters.findById(req.params.winterId)
    .then((winter) => {
        if(req.user.admin === true || JSON.stringify(winter.likes.id(req.params.likeId).author._id) == JSON.stringify(req.user._id)) {
            if (winter != null && winter.likes.id(req.params.likeId) != null) {
                winter.likes.id(req.params.likeId).remove();
                winter.save()
                .then((winter) => {
                    Winters.findById(winter._id)
                    .populate('likes.author')
                    .then((winter) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(winter);
                    })
                }, (err) => next(err));
            }
            else if (winter == null) {
                err = new Error('winter ' + req.params.winterId + ' not found ');
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


module.exports = winterRouter;

