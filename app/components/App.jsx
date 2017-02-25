import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';
import SharesTable from './SharesTable';

export default class App extends React.Component {
  static childContextTypes = {
    sharesTable: React.PropTypes.object.isRequired,
    dropboxAccessToken: React.PropTypes.string
  };

  dropboxAccessToken: '';
  sharesTable = new SharesTable();

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
      sharesTable: this.sharesTable,
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
