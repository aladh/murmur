import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';

export default class UploadPage extends React.Component {
  dbx = new Dropbox({accessToken: ''});
  state = {linkId: '', key: ''};

  async uploadToDropbox(blob, fileName) {
    let response = await this.dbx.filesUpload({
      path: `/${fileName}`,
      contents: blob
    });
    return response
  }

  async getSharedDropboxLink(fileName) {
    return await this.dbx.sharingCreateSharedLinkWithSettings({
        path: `/${fileName}`
    })
  }

  uploadFile = async ({target: {files}}) => {
    let f = files[0];
    let result = await utils.bufferFromBlob(f)
    let encrypted = await utils.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    let encryptedFileName = await utils.encryptedFileName(f.name, encrypted.iv, encrypted.key);
    await this.uploadToDropbox(blob, encryptedFileName);
    let {url: shareLink} = await this.getSharedDropboxLink(encryptedFileName);
    let linkId = await utils.sha256(encryptedFileName);
    await this.setState({linkId: linkId, key: encrypted.jwk})
    sessionStorage.setItem(linkId, JSON.stringify({iv: Array.from(encrypted.iv), fileName: encryptedFileName, link: shareLink}))
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
