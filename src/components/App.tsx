import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

const parseHashParams = () => {
  return {params: new URLSearchParams(window.location.hash.slice(1))}
};

export default class App extends React.Component<{}, {params: URLSearchParams}> {
  state = parseHashParams();

  routeToPage() {
    let dropboxAccessToken = this.state.params.get('access_token');

    if(this.downloadParamsPresent()) {
      return (
        <DownloadPage
          jwk={this.state.params.get('key')}
          iv={this.state.params.get('iv')}
          filename={this.state.params.get('filename')}
          shareLink={this.state.params.get('shareLink')}
        />
      )
    } else if(!dropboxAccessToken) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={dropboxAccessToken} />
    }
  }

  downloadParamsPresent() {
    let params = this.state.params;
    return params.has('iv') && params.has('key') && params.has('shareLink') && params.has('filename')
  }

  componentDidMount() {
    window.onpopstate = () => this.setState(parseHashParams())
  }

  render() {
    return (
      <div className="app">
        {this.routeToPage()}
      </div>
    );
  }
}
