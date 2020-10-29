'use strict';

const express = require('express');
const fs = require('fs');

let seasonal_css_head = '';
let seasonal_css = '';

const app = express();
app.get('/', (req,res) => {
    res.setHeader('Content-Type', 'text/css');
    res.send(generate_css(req.query.day));
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

// colours are in HSL with range [0..359, 0..100, 0..100]
let seasons = [
    {
        name: 'winter',
        peakday: 14,
        bg: [240, 16, 92],
        fg: [4, 8, 39],
        hl: [221, 43, 27]
    },
    {
        name: 'spring',
        peakday: 104,
        bg: [59, 100, 92],
        fg: [93, 89, 36],
        hl: [341, 65, 68]
    },
    {
        name: 'summer',
        peakday: 194,
        bg: [187, 100, 89],
        fg: [50, 88, 40],
        hl: [31, 100, 51]
    },
    {
        name: 'autumn',
        peakday: 284,
        bg: [140, 79, 96],
        fg: [15, 100, 29],
        hl: [26, 97, 49],
    }
];

// https://stackoverflow.com/a/8619946
function day_of_year() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var diff = now - start;
    var oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// hsl1,hsl2 should be [H, S, L] arrays and k should be 0..1
// you'll get hsl1 at k=0 and hsl2 at k=1
function blend(hsl1, hsl2, k) {
    let hue = hsl1[0]*(1-k)+hsl2[0]*k;
    if (Math.abs(hsl1[0] - hsl2[0]) > 180) {
        // blend the other way around the colour wheel
        let a = hsl1[0];
        let b = hsl2[0];
        if (a > b) {
            b += 360;
        } else {
            a += 360;
        }
        hue = a*(1-k)+b*k;
    }
    while (hue > 360)
        hue -= 360;
    return [
        hue,
        hsl1[1]*(1-k)+hsl2[1]*k,
        hsl1[2]*(1-k)+hsl2[2]*k
    ];
}

// TODO: take optional date, latitude, etc. parameters
// TODO: handle 366-day years
function generate_css(requested_day) {
    // select the 2 seasons that this day lies between
    let season1, season2;
    let day = day_of_year();

    if (requested_day !== undefined && requested_day >= 0 && requested_day < 366) {
        day = requested_day;
    }

    season1 = seasons[seasons.length-1];
    season2 = seasons[0];
    for (let i = 0; i < seasons.length; i++) {
        if (day < seasons[i].peakday) {
            season1 = seasons[(i-1+seasons.length)%seasons.length];
            season2 = seasons[i];
            break;
        }
    }
    // work out what proportion of the way through we are
    let length = season2.peakday - season1.peakday;
    let day_within;
    let proportion
    if (length > 0) {
        day_within = day - season1.peakday;
        proportion = day_within / length;
    } else {
        length = season2.peakday + 366 - season1.peakday;
        day_within = day - season1.peakday;
        if (day_within < 0)
            day_within += 366;
        proportion = day_within / length;
    }
    let vars = {
        bg: blend(season1.bg, season2.bg, proportion),
        fg: blend(season1.fg, season2.fg, proportion),
        hl: blend(season1.hl, season2.hl, proportion),
    };

    let css = "/* Seasonal.css by James Stanley\n";
    css += "day " + day + ": " + proportion + " between " + season1.name + " and " + season2.name + " */\n\n";
    css += ":root {\n";
    for (let varname in vars) {
        let col = vars[varname];
        css += "    --seasonal-" + varname + ": hsl(" + col[0] + "," + col[1] + "%," + col[2] + "%);\n";
    }
    css += "}\n\n";

    return css + seasonal_css;
}

app.listen(8080, '0.0.0.0');
console.log("Listening on http://0.0.0.0:8080");

process.on('SIGTERM', function() {
    process.exit(0);
});
