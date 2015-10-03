#!/bin/bash

rm public/min/*

TMP=$(mktemp)

# Order should match the one in index.js
FILES=(uuid.js util.js vector.js resource_loader.js game.js entity.js weapon.js player.js wall.js explosion.js bullet.js client.js script.js)

for filename in "${FILES[@]}"; do
    echo "Pasting $filename"
    cat "src/$filename" >> "$TMP"
done

echo "Minifying $TMP"
java -jar yuicompressor-2.4.8.jar $TMP -o public/min/code.min.js --charset utf-8 --type js

rm $TMP
echo $TMP deleted
