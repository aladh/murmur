import 'babel-polyfill';
import dropbox from '../../shared/dropbox';

export default (event, context, callback) => {
  event.Records.forEach(record => {
    if (record.eventName == 'REMOVE') dropbox.deleteFile(record.dynamodb.OldImage.accessToken.S, record.dynamodb.OldImage.fileName.S)
  });

  callback(null, `Successfully processed ${event.Records.length} records.`);
}
