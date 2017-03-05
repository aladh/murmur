import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

export default class App extends React.Component {
  dropboxAccessToken = new URLSearchParams(location.hash.slice(1)).get('access_token');

  renderPage() {
    if(location.pathname.length > 1) {
      return <DownloadPage />
    } else if(!this.dropboxAccessToken) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={this.dropboxAccessToken} />
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
