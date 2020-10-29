'use strict';

const express = require('express');
const fs = require('fs');

let seasonal_css_head = '';
let seasonal_css = '';

const app = express();
app.get('/', (req,res) => {
    res.setHeader('Content-Type', 'text/css');
    res.send(generate_css());
});

fs.readFile('seasonal.css.head', 'utf8', function (err,data) {
    if (err)
        return console.log(err);
    seasonal_css_head = data;
});
fs.readFile('seasonal.css', 'utf8', function (err,data) {
    if (err)
        return console.log(err);
    seasonal_css = data;
});

// TODO: take optional date, latitude, etc. parameters
function generate_css() {
    // TODO: function to calculate palette
    let bg_colour = 'rgb(255,0,0)';
    let fg_colour = 'rgb(0,255,0)';

    return seasonal_css_head.replace("__BG_COLOUR__", bg_colour).replace("__FG_COLOUR__", fg_colour)
         + seasonal_css;
}

app.listen(8080, '0.0.0.0');
console.log("Listening on http://0.0.0.0:8080");

process.on('SIGTERM', function() {
    process.exit(0);
});
