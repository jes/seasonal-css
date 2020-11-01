(function(exports) {
    // https://v6.robweychert.com/blog/2019/12/dynamic-color-javascript-hsl/
    let keyframes = [
      //  day    hue     sat      hlsat
      [   0,     270,    0.08,    0.30  ],
      [  31,     240,    0.11,    0.40  ],
      [  60,     210,    0.20,    0.40  ],
      [  91,     180,    0.20,    0.40  ],
      [ 120,     150,    0.18,    0.40  ],
      [ 151,     120,    0.15,    0.40  ],
      [ 181,      90,    0.18,    0.20  ],
      [ 212,      60,    0.21,    0.35  ],
      [ 243,      30,    0.28,    0.60  ],
      [ 273,       0,    0.18,    0.45  ],
      [ 304,     -30,    0.10,    0.25  ],
      [ 334,     -60,    0.10,    0.30  ],
      [ 365,     -90,    0.08,    0.30  ]
    ];

    // lerp from a to b by k amount. k=0 to 1
    // k=0 gives a, k=1 gives b
    let lerp = function(a, b, k) {
        return a*(1-k) + b*k;
    };

    // https://stackoverflow.com/a/8619946
    exports.day_of_year = function() {
        var now = new Date();
        var start = new Date(now.getFullYear(), 0, 1);
        var diff = now - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    exports.vars = function(requested_day) {
        let day = exports.day_of_year();

        if (requested_day !== undefined && requested_day >= 0 && requested_day < 366)
            day = requested_day;

        let hue, hlhue, sat, hlsat;
        for (let i = 1; i < keyframes.length; i++) {
            if (keyframes[i][0] >= day) {
                let k = (day - keyframes[i-1][0]) / (keyframes[i][0] - keyframes[i-1][0]);
                hue = lerp(keyframes[i-1][1], keyframes[i][1], k);
                hlhue = hue - 15;
                sat = 100*lerp(keyframes[i-1][2], keyframes[i][2], k);
                hlsat = 100*lerp(keyframes[i-1][3], keyframes[i][3], k);
                break;
            }
        }

        return {
            bg: 'hsl(' + hue + ',' + sat + '%,96%)',
            bgdark: 'hsl(' + hue + ',' + sat + '%,90%)',
            fg: 'hsl(' + hue + ',' + sat + '%,30%)',
            hl: 'hsl(' + hlhue + ',' + hlsat + '%,50%)',
            hldark: 'hsl(' + hlhue + ',' + hlsat + '%,35%)'
        };
    }

    exports.css = function(requested_day) {
        let vars = exports.vars(requested_day);

        let css = "/* Seasonal.css by James Stanley\n   https://seasonal-css.incoherency.co.uk/ */\n";
        css += ":root {\n";
        for (let varname in vars) {
            let col = vars[varname];
            css += "    --seasonal-" + varname + ": " + vars[varname] + ";\n";
        }
        css += "}\n\n";

        return css;
    };
}(typeof exports === 'undefined' ? this.seasonal = {} : exports));
