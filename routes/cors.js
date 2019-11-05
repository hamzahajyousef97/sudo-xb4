const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = ['https://xbfour.com', 'https://www.xbfour.com', 'https://xb4-control.firebaseapp.com', 'https://server.xbfour.com' , 'https://xb-four.firebaseapp.com'];
var corsOptionsDelegate = (req, callback) => {
    var corsOptions;

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
