import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

export default class App extends React.Component {
  componentWillMount() {
    if(location.hash.includes('access_token')) {
      sessionStorage.setItem('dropboxAccessToken', location.hash.match(/#access_token=(\w*)&/)[1])
    }
  }

  renderPage() {
    if(location.pathname.length > 1) {
      return <DownloadPage />
    } else if(!sessionStorage.getItem('dropboxAccessToken')) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={sessionStorage.getItem('dropboxAccessToken')} />
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
