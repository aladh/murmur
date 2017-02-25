import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';

export default class UploadPage extends React.Component {
  static contextTypes = {
    sharesTable: React.PropTypes.object.isRequired,
    dropboxAccessToken: React.PropTypes.string.isRequired
  };

  dbx = new Dropbox({accessToken: this.context.dropboxAccessToken});
  state = {linkId: '', key: ''};

  uploadFile = async ({target: {files}}) => {
    let file = files[0];
    let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

    let encryptedFileName = await utils.encryptedFileName(file.name, iv, key);
    await utils.dropbox.upload(this.dbx, new Blob([encrypted]), encryptedFileName);

    let {url: shareLink} = await utils.dropbox.getSharedLink(this.dbx, encryptedFileName);
    let linkId = await utils.sha256(encryptedFileName);

    await this.context.sharesTable.putItem(linkId, iv, encryptedFileName, shareLink);
    this.setState({linkId: linkId, key: jwk})
  };

  render() {
    return (
      <div>
        <span>Select a file to upload:</span>
        <input type='file' onChange={this.uploadFile}/>
        <div />
        <span>{`Your share link is: http://localhost:3333/s/${this.state.linkId}#${this.state.key}`}</span>
      </div>
    );
  }
}
