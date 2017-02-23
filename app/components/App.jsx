import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';

export default class App extends React.Component {
  renderPage() {
    if(location.pathname.length > 1) {
      return <DownloadPage />
    } else {
      return <UploadPage />
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
