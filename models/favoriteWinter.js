const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteWinterSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    winters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Winter'
        }
    ]
},{
    timestamps: true 
});

var FavoriteWinters = mongoose.model('FavoriteWinter', favoriteWinterSchema);

module.exports = FavoriteWinters;