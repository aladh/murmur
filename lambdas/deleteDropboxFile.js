'use strict';

const deleteDropboxFile = require('resources/dropbox');

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    if (record.eventName == 'REMOVE') deleteDropboxFile(record.dynamodb.OldImage.accessToken.S, record.dynamodb.OldImage.fileName.S)
  });

  callback(null, `Successfully processed ${event.Records.length} records.`);
};
