import React from 'react';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import AuthPage from './AuthPage';

export default class App extends React.Component {
  state = this.stateFromParams();

  stateFromParams() {
    return {
      params: new URLSearchParams(location.hash.slice(1))
    }
  }

  routeToPage() {
    let dropboxAccessToken = this.state.params.get('access_token');
    let shareId = this.state.params.get('share');

    if(shareId) {
      return <DownloadPage shareId={shareId} jwk={this.state.params.get('key')} />
    } else if(!dropboxAccessToken) {
      return <AuthPage />
    } else {
      return <UploadPage dropboxAccessToken={dropboxAccessToken} />
    }
  }

  componentDidMount() {
    window.onpopstate = () => this.setState(this.stateFromParams())
  }

  render() {
    return (
      <div className="app">
        {this.routeToPage()}
      </div>
    );
  }
}
