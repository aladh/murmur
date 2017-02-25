import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';
import DynamoDB from 'aws-sdk/clients/dynamodb';
import secrets from '../secrets';

export default class App extends React.Component {
  shares = new DynamoDB({apiVersion: '2012-08-10',
                           params: {TableName: 'shares'},
                           region: 'us-east-1',
                           credentials: {accessKeyId: secrets.awsAccessKeyId,
                                         secretAccessKey: secrets.awsSecretAccessKey}
                         });

  componentWillMount() {
    if(location.hash.includes('access_token')) {
      sessionStorage.setItem('dropboxAccessToken', location.hash.match(/#access_token=(\w*)&/)[1])
    }
  }

  renderPage() {
    if(location.pathname.length > 1) {
      return <DownloadPage shares={this.shares} />
    } else if(!sessionStorage.getItem('dropboxAccessToken')) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={sessionStorage.getItem('dropboxAccessToken')} shares={this.shares} />
    }
  }

  render() {
    return (
      <div id="content">
        {this.renderPage()}
      </div>
    );
  }
}
