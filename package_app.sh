#!/bin/bash
set -e #fail on error

mkdir -p ./build/tmp

# remove old artifacts
rm ./build/tmp/application.zip || true
rm ./build/custom-kaiOS-launcher.zip || true

# copy stuff
cp ./metadata.json ./build/tmp/metadata.json

cd build/tmp

zip -jqr application.zip ../../dist

cd ..

zip -jqr custom-kaiOS-launcher.zip tmp

echo "Created custom-kaiOS-launcher.zip"