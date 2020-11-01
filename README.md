# seasonal-css

Seasonal.css supplies a seasonal colour scheme based on the day of the year.

Check out the live preview at https://seasonal-css.incoherency.co.uk/

Use it in your own pages:

    <link rel="stylesheet" type="text/css" href="https://seasonal-css.incoherency.co.uk/seasonal.css"> 

## What does it do?

A hue is calculated for each day by mapping days of the year to positions on the
colour wheel. This idea [comes from Rob Weychert](https://v6.robweychert.com/blog/2019/12/dynamic-color-javascript-hsl/).

Once the hue is calculated, different shades are chosen for the foreground and background colours, and a slightly
different hue is taken to be used as a "highlight" colour. These colours are then put into CSS variables so that
they can be used in the theme.

The default Seasonal.css theme will work for basic sites, but if you want to do something more complicated
you can fetch `/seasonal.css?varsonly=1` and you'll get the Seasonal.css variables without the default styles.

## Why?

One morning recently, while looking out of my window at the autumnal leaves on the trees, I thought to
myself "my, what beautiful colours, I wish I could have these on my website". The idea fermented for a little
while and I eventually realised that it would be possible for the colours of the website to change
to match the colours of the seasons.

I enjoy how the colours of the natural world change throughout the year and wanted to bring the same experience
to the web.

## How do I self-host it?

Check out this git repository and build the docker image:

    $ docker build -t seasonal-css

Then simply deploy the docker image anywhere you want to host it. The web server is exposed
on port 8080 and serves seasonal CSS at `/seasonal.css`.

## How do I contact you?

Please email james@incoherency.co.uk or see my blog at https://incoherency.co.uk/
