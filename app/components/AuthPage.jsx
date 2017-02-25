import React from 'react';
import Dropbox from 'dropbox';
import secrets from '../secrets';

export default class AuthPage extends React.Component {
  dbx = new Dropbox({clientId: secrets.dropboxClientId});
  state = {authUrl: ''}

  componentDidMount() {
    this.setState({authUrl: this.dbx.getAuthenticationUrl('http://localhost:3333/')})
  }

  render() {
    return (
      <div>
        <h3>Choose a provider</h3>
        <a href={this.state.authUrl}>
          Authenticate with Dropbox
        </a>
      </div>
    )
  }
}
