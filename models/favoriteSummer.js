const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSummerSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    summers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Summer'
        }
    ]
},{
    timestamps: true 
});

var FavoriteSummers = mongoose.model('FavoriteSummer', favoriteSummerSchema);

module.exports = FavoriteSummers;