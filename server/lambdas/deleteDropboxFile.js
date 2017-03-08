import 'babel-polyfill';
import dropbox from '../../shared/dropbox';
import bugsnag from 'bugsnag';
import secrets from '../secrets';

export default ({Records}, context, callback) => {
  bugsnag.register(secrets.bugsnagApiKey);

  try {
    Records.forEach(record => {
      if (record.eventName == 'REMOVE') dropbox.deleteFile(record.dynamodb.OldImage.accessToken.S, record.dynamodb.OldImage.fileName.S)
    });

    callback(null, `Successfully processed ${Records.length} records.`);
  } catch(e) {
    bugsnag.notify(e);
    console.error(`Failed to process records: ${JSON.stringify(Records)}`)
  }
}
