import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

export default class App extends React.Component {
  static childContextTypes = {
    dropboxAccessToken: React.PropTypes.string
  };

  dropboxAccessToken: '';

  renderPage() {
    if(location.pathname.length > 1) {
      return <DownloadPage />
    } else if(!this.authenticated()) {
      return <AuthPage />
    } else {
      return <UploadPage />
    }
  }

  authenticated() {
    return location.hash.includes('access_token')
  }

  getChildContext() {
    return {
      dropboxAccessToken: this.dropboxAccessToken
    }
  }

  componentWillMount() {
    if(this.authenticated()) this.dropboxAccessToken = location.hash.match(/#access_token=(([^&])*)&/)[1]
  }

  render() {
    return (
      <div id="content">
        {this.renderPage()}
      </div>
    );
  }
}
