'use strict';

const express = require('express');
const fs = require('fs');

let seasonal_css = '';
let index_html = '';

const app = express();
app.get('/', (req,res) => {
    res.setHeader('Content-Type', 'text/html');
    res.send(index_html);
});
app.get('/seasonal.css', (req,res) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'nocache');
    res.setHeader('Expires', 'now');
    res.send(generate_css(req.query.day));
});

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

// https://v6.robweychert.com/blog/2019/12/dynamic-color-javascript-hsl/
let keyframes = [
  //  day    hue     sat      hlsat
  [   0,     270,    0.08,    0.50  ],
  [  31,     240,    0.11,    1.00  ],
  [  60,     210,    0.20,    0.55  ],
  [  91,     180,    0.22,    0.55  ],
  [ 120,     150,    0.26,    0.55  ],
  [ 151,     120,    0.20,    0.55  ],
  [ 181,      90,    0.40,    0.55  ],
  [ 212,      60,    0.28,    0.55  ],
  [ 243,      30,    0.32,    0.70  ],
  [ 273,       0,    0.18,    0.45  ],
  [ 304,     -30,    0.10,    0.35  ],
  [ 334,     -60,    0.10,    1.00  ],
  [ 365,     -90,    0.10,    1.00  ]
];

// lerp from a to b by k amount. k=0 to 1
// k=0 gives a, k=1 gives b
function lerp(a, b, k) {
    return a*(1-k) + b*k;
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

    let hue, hlhue, sat, hlsat;
    for (let i = 1; i < keyframes.length; i++) {
        if (keyframes[i][0] >= day) {
            let k = (day - keyframes[i-1][0]) / (keyframes[i][0] - keyframes[i-1][0]);
            hue = lerp(keyframes[i-1][1], keyframes[i][1], k);
            hlhue = hue - 30;
            sat = 100*lerp(keyframes[i-1][2], keyframes[i][2], k);
            hlsat = 100*lerp(keyframes[i-1][3], keyframes[i][3], k);
            break;
        }
    }

    let vars = {
        bg: [hue,sat,96],//blend(season1.bg, season2.bg, proportion),
        bgdark: [hue,sat,90],//blend(season1.bg, season2.bg, proportion),
        fg: [hue,sat,30],//blend(season1.fg, season2.fg, proportion),
        hl: [hlhue,hlsat,50],//blend(season1.hl, season2.hl, proportion),
        hldark: [hlhue, hlsat, 20],
    };

    let css = "/* Seasonal.css by James Stanley */\n";
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
