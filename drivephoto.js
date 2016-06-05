/* Google Drive Photo Scraper
   Author: Nick Aiello
   Last Update: 6/2/2016

   Adapted from https://developers.google.com/drive/v3/web/quickstart/nodejs
*/
'use strict';

var fs = require('fs'),
    config = require('./config.js'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library'),
    readline = require('readline');

var SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) +
      '/photoframe/.credentials/';
var TOKEN_FILE = TOKEN_DIR + 'photoframe.json';
var CLIENT_KEYFILE = 'drive_client_secret.json';

var credentials;
var client;

exports.init = function (callback) {
  // load app key and secret
  fs.readFile(CLIENT_KEYFILE, function (error, content) {
    if (error) {
      console.error(error);
      return;
    }

    credentials = JSON.parse(content);
    var auth = new googleAuth();
    var oAuth2Client = new auth.OAuth2(
      credentials.installed.client_id,
      credentials.installed.client_secret,
      credentials.installed.redirect_uris[0]
    );

    fs.readFile(TOKEN_FILE, function (error, content) {
      if (error) { // no saved tokens found
        getNewToken(oAuth2Client, callback);
      } else { // use the cached token
        oAuth2Client.credentials = JSON.parse(content);
        client = oAuth2Client;
        if (callback) {
          callback(oAuth2Client);
        }
      }
    });
  });
};

exports.listPhotos = function (callback) {
  var query = "mimeType = 'image/jpeg' and '"+config.drive.sharedFolderId+"' in parents";

  if (!client) {
    console.error('Not authenticated');
    return;
  }

  var service = google.drive('v3');
  service.files.list({
    auth: client,
    q: query
  }, callback);
};

exports.downloadFile = function (destPath, fileId, callback) {
  var service = google.drive('v3');
  var dest = fs.createWriteStream(destPath);
  service.files.get({auth: client, fileId: fileId, alt: 'media'}).pipe(dest);
}

/* Private helper methods */
function getNewToken(oAuth2Client, callback) {
  var authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize at this link: ', authUrl);

  var rl = readline.createInterface({input: process.stdin, output: process.stdout});
  rl.question('Enter the authorization code: ', function (code) {
    rl.close();
    oAuth2Client.getToken(code, function (error, token) {
      if (error) {
        console.error(error);
        return;
      }

      oAuth2Client.credentials = token;
      client = oAuth2Client;
      storeToken(token);
      if (callback) {
        callback(oAuth2Client);
      }
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(error);
    }
  }

  fs.writeFile(TOKEN_FILE, JSON.stringify(token));
  console.log('cached token');
}
