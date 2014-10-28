#!/bin/sh
node src/main/webapp/r.js -o src/main/webapp/build-config.js
madge --format amd --optimized src/main/webapp/js/mind-map-built.js -c