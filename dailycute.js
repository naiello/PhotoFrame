/* DailyCute Scraper
   Author: Nick Aiello
   Last Modified: 6/2/2016
*/
'use strict';

var rest = require('restler'),
    fs = require('fs'),
    http = require('http');

exports.downloadRandom = function(destPath, callback) {
  rest.get('http://api.dailycute.net/v1/posts/random.json')
    .on('complete', function (result) {
      if (result && result.post && result.post.image_src) {
        http.get(result.post.image_src, function (response) {
          var dest = fs.createWriteStream(destPath + '/' + result.post.id + '.jpg');
          response.pipe(dest);
          if (callback) {
            callback(result);
          }
        });
      }
    });
}
