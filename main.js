'use strict';

const express = require('express');
const fs = require('fs');

const seasonal = require('./seasonal.js');

let seasonal_css = '';
let index_html = '';

const app = express();
app.get('/seasonal.css', (req,res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'nocache');
    res.setHeader('Expires', '0');
    let css = seasonal.css(req.query.day);
    if (req.query.varsonly) {
        res.send(css);
    } else {
        res.send(css + seasonal_css);
    }
});

// use express.static() to provide index.html and seasonal.js
app.use(express.static('.'));

// XXX: race condition while loading up where we might get a request before data is loaded
fs.readFile('seasonal.css', 'utf8', function (err,data) {
    if (err)
        return console.log(err);
    seasonal_css = data;
});
fs.readFile('index.html', 'utf8', function (err,data) {
    if (err)
        return console.log(err);
    index_html = data;
});

app.listen(8080, '0.0.0.0');
console.log("Listening on http://0.0.0.0:8080");

process.on('SIGTERM', function() {
    process.exit(0);
});
