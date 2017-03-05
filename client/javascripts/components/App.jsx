import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

export default class App extends React.Component {
  params = new URLSearchParams(location.hash.slice(1));

  routeToPage() {
    let dropboxAccessToken = this.params.get('access_token');
    let shareId = this.params.get('share');

    if(shareId) {
      return <DownloadPage shareId={shareId} jwk={this.params.get('key')} />
    } else if(!dropboxAccessToken) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={dropboxAccessToken} />
    }
  }

  render() {
    return (
      <div id="content">
        {this.routeToPage()}
      </div>
    );
  }
}
