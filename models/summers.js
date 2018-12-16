const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},{
    timestamps: true
});

const likeSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
},{
    timestamps: true
});

const summerSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    nameEN: {
        type: String,
        required: true
    },
    nameAR: {
        type: String,
        required: true
    },
    descriptionEN: {
        type: String,
        required: true
    },
    descriptionAR: {
        type: String,
        required: true
    },
    colorEN: {
        type: String,
        required: true   
    },
    colorAR: {
        type: String,
        required: true
    },
    clothEN: {
        type: String,
        required: true
    },
    clothAR: {
        type: String,
        required: true
    },
    imgFront: {
        type: String,
        required: true
    },
    imgBack: {
        type: String,
        required: true
    },
    imgRight: {
        type: String,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    small: {
        type: Boolean,
        required: true,
        default: false
    },
    medium: {
        type: Boolean,
        required: true,
        default: false
    },
    large: {
        type: Boolean,
        required: true,
        default: false
    },
    commentNum: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    likes: [likeSchema]
},{
    timestamps: true
});

var Summers = mongoose.model('Summer', summerSchema);

module.exports = Summers;
