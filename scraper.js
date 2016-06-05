/* Web Photo Scraper
   Author: Nick Aiello
   Last Updated: 6/5/2016
*/
'use strict';

var dailycute = require('./dailycute');

var PROP_DCUTE = 0.3;
var PHOTO_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
      '/photoframe/photos/';

/*drive.init(function() {
  drive.listPhotos(function(response) { console.log(response); })
});*/

dailycute.downloadRandom('C:\\Users\\Nick\\Photos\\', function (response) {
  console.log(response);
});
