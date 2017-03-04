'use strict';

const Dropbox = require('dropbox');

const client = (accessToken) => {
  return new Dropbox({accessToken})
};

const deleteFile = (accessToken, fileName) => {
  return client(accessToken).filesDelete({
      path: `/${fileName}`
  })
};

module.exports = deleteFile;
