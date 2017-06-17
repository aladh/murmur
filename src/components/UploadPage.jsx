import React from 'react';
import PropTypes from 'prop-types';
import utils from '../utils';
import Status from './Status';
import api from '../api';

export default class UploadPage extends React.Component {
  static propTypes = {
    dropboxAccessToken: PropTypes.string.isRequired
  };

  state = {linkId: '', key: '', status: ''};

  uploadFile = async ({target: {files}}) => {
    try {
      let [file] = files;
      this.setState({status: 'Encrypting'});
      let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

      let encryptedFileName = await utils.encryptedFileName(file.name, iv, key);
      this.setState({status: 'Uploading'});
      await utils.dropbox.upload(this.props.dropboxAccessToken, new Blob([encrypted]), encryptedFileName);

      let {url: shareLink} = await utils.dropbox.getSharedLink(this.props.dropboxAccessToken, encryptedFileName);
      let linkId = await utils.sha256(encryptedFileName);

      await api.createShare({
        id: linkId,
        iv: Array.from(iv),
        fileName: encryptedFileName,
        accessToken: this.props.dropboxAccessToken,
        shareLink});

      this.setState({linkId: linkId, key: jwk, status: 'Done!'})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred'});
      throw e
    }
  };

  renderShareLink() {
    let params = new URLSearchParams();
    params.set('share', this.state.linkId);
    params.set('key', this.state.key);

    if(this.state.linkId) {
      return (
        <div>
          <span>Your share link is: </span>
          <input value={`${utils.baseURL()}#${params.toString()}`} onClick={e => e.target.select()} readOnly />
          <br/>
          <br/>
          <small>Note:
            <ul>
              <li>This link contains the key to decrypt your file</li>
              <li>Your file will be deleted as soon as someone downloads it</li>
              <li>If not downloaded in 7 days, your file will be deleted</li>
            </ul>
          </small>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="upload-page">
        <h3>Upload a file</h3>
        <input type='file' onChange={this.uploadFile}/>
        <br/>
        <br/>
        <Status message={this.state.status} />
        <br/>
        {this.renderShareLink()}
      </div>
    );
  }
}
