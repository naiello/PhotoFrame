#! /bin/sh

mkdir "$HOME/photoframe"
pushd "$HOME/photoframe"
git clone 'https://github.com/naiello/PhotoFrame.git'
mkdir "$HOME/photoframe/photos"
mkdir "$HOME/photoframe/photos/dailycute"
mkdir "$HOME/photoframe/photos/googledrive"
mkdir "$HOME/photoframe/.credentials/"

npm install
npm install -g forever
forever start scraper.js
popd
