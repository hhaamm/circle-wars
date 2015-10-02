#!/bin/bash

for filename in src/*.js; do
    echo "Minifying $filename"
    java -jar yuicompressor-2.4.8.jar $filename -o $filename-min.js --charset utf-8
    mv src/*min.js public/min/
done
