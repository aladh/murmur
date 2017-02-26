import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';

export default class UploadPage extends React.Component {
  static contextTypes = {
    sharesTable: React.PropTypes.object.isRequired,
    dropboxAccessToken: React.PropTypes.string.isRequired
  };

  state = {linkId: '', key: ''};

  uploadFile = async ({target: {files}}) => {
    let file = files[0];
    let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

    let encryptedFileName = await utils.encryptedFileName(file.name, iv, key);
    await utils.dropbox.upload(new Dropbox({accessToken: this.context.dropboxAccessToken}), new Blob([encrypted]), encryptedFileName);

    let linkId = await utils.sha256(encryptedFileName);

    await this.context.sharesTable.putItem(linkId, iv, encryptedFileName, this.context.dropboxAccessToken);
    this.setState({linkId: linkId, key: jwk})
  };

  renderShareLink() {
    if(this.state.linkId) {
      return (
        <span>
          Your share link is:
          <input value={`http://localhost:3333/s/${this.state.linkId}#${this.state.key}`} onClick={e => e.target.select()} readOnly />
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
        {this.renderShareLink()}
      </div>
    );
  }
}
