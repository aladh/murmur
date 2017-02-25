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
    return <a href={this.state.authUrl}>
      Auth
    </a>
  }
}
