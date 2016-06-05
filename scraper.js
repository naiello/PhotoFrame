/* Web Photo Scraper
   Author: Nick Aiello
   Last Updated: 6/5/2016
*/
'use strict';

var dailycute = require('./dailycute'),
    drive = require('./drivephoto'),
    fs = require('fs');

var PROP_DCUTE = 0.3;
var MAX_DCUTE_PHOTOS = 20;
var PHOTO_DIR = (process.env.HOME) +
      '/photoframe/photos/';
var DCUTE_DIR = PHOTO_DIR + 'dailycute/';
var DRIVE_DIR = PHOTO_DIR + 'googledrive/';

var SLIDE_TIME = 5000; // photos stay up for 1 minute each
var DRIVE_REFRESH_RATE = 300000; // every 5 minutes
var DCUTE_REFRESH_RATE = 120000; // every 2 minutes

/* Init/auth Google Drive connection */
drive.init(function() {
  // do initial sync
  syncDailyCute();
  syncGoogleDrive();

  // sync periodically forever
  setInterval(syncDailyCute, DCUTE_REFRESH_RATE);
  setInterval(syncGoogleDrive, DRIVE_REFRESH_RATE);
  setInterval(showNextSlide, SLIDE_TIME);
});

/* Synchronizes the local folder with Google Drive */
function syncGoogleDrive() {
  drive.listPhotos(function(error, response) {
    if (error) {
      console.error(error);
      return;
    }
    var driveNameList = response.files.map(function (file) { return file.name; });
    var localNameList = [];

    // delete files that have been removed from drive
    fs.readdir(DRIVE_DIR, function (err, files) {
      if (err) {
        console.error(err);
        return;
      }
      localNameList = files;

      files.forEach(function(file) {
        if (driveNameList.indexOf(file) === -1) {
          fs.unlink(DRIVE_DIR + file);
        }
      });
    });

    // download new files from drive
    response.files.forEach(function(file) {
      if (!fs.existsSync()) {
        drive.downloadFile(DRIVE_DIR + file.name, file.id);
      }
    });
  });
}

/* 'Synchronizes' Daily Cute image pool.  Downloads up to MAX_DCUTE_PHOTOS
   from Daily Cute.  If number of photos is already equal to MAX_DCUTE_PHOTOS,
   will delete the oldest image, and download new images to replace them. */
function syncDailyCute() {
  fs.readdir(DCUTE_DIR, function (err, files) {
    if (err) {
      console.log('couldn\'t readdir: ' + err);
      return;
    }
    var oldestImage, oldestImageTime;
    var numImages = 0;
    files.forEach(function(file) {
      if (file.indexOf('.jpg') !== -1) {
        numImages++;
        var stats = fs.statSync(DCUTE_DIR + file);
        if (!oldestImage || oldestImageTime > stats.ctime) {
          oldestImage = file;
          oldestImageTime = stats.ctime;
        }
      }
    });

    if (numImages >= MAX_DCUTE_PHOTOS) {
      fs.unlink(DCUTE_DIR + oldestImage);
      numImages--;
    }

    var downloadInterval = setInterval(function() {
      if (numImages >= MAX_DCUTE_PHOTOS) {
        clearInterval(downloadInterval);
      }
      dailycute.downloadRandom(DCUTE_DIR);
      numImages++;
    }, 500); // every half second to not spam the API
  });
}

/* Copies the next slide to current.jpg */
function showNextSlide() {
  var r = Math.random();
  var source = DRIVE_DIR;
  var deleteAfterShowing = false;
  if (r < PROP_DCUTE) {
    deleteAfterShowing = true;
    source = DCUTE_DIR;
  }

  fs.readdir(source, function (err, files) {
    var rfile = Math.floor(files.length * Math.random());
    var nextPhoto = source + files[rfile];

    fs.createReadStream(nextPhoto).pipe(fs.createWriteStream(PHOTO_DIR + 'current.jpg'));
    if (deleteAfterShowing) {
      fs.unlink(nextPhoto);
    }
  });
}
