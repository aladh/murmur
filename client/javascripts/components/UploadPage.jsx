import React from 'react';
import utils from '../utils';
import Status from './Status';
import secrets from '../../secrets';

export default class UploadPage extends React.Component {
  static propTypes = {
    dropboxAccessToken: React.PropTypes.string.isRequired
  };

  state = {linkId: '', key: '', status: ''};

  uploadFile = async ({target: {files}}) => {
    let file = files[0];
    this.setState({status: 'Encrypting'});
    let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

    let encryptedFileName = await utils.encryptedFileName(file.name, iv, key);
    this.setState({status: 'Uploading'});
    await utils.dropbox.upload(this.props.dropboxAccessToken, new Blob([encrypted]), encryptedFileName);

    let {url: shareLink} = await utils.dropbox.getSharedLink(this.props.dropboxAccessToken, encryptedFileName);
    let linkId = await utils.sha256(encryptedFileName);

    await fetch('https://api.biimer.com/shares/', {
      headers: {'x-api-key': secrets.apiKey},
      method: 'POST',
      body: JSON.stringify({id: linkId, iv: Array.from(iv), fileName: encryptedFileName, accessToken: this.props.dropboxAccessToken, shareLink})
    });

    this.setState({linkId: linkId, key: jwk, status: 'Done!'})
  };

  renderShareLink() {
    if(this.state.linkId) {
      return (
        <span>
          Your share link is:
          <input value={`${utils.baseURL()}s/${this.state.linkId}#${this.state.key}`} onClick={e => e.target.select()} readOnly />
        </span>
      )
    }
  }

  render() {
    return (
      <div>
        <h3>Upload a file</h3>
        <span>Select a file to upload:</span>
        <input type='file' onChange={this.uploadFile}/>
        <div />
        <Status message={this.state.status} />
        <div />
        {this.renderShareLink()}
      </div>
    );
  }
}
