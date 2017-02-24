import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';
import dropbox from './dropbox';

export default class UploadPage extends React.Component {
  dbx = new Dropbox({accessToken: ''});
  state = {linkId: '', key: ''};

  uploadFile = async ({target: {files}}) => {
    let f = files[0];
    let result = await utils.bufferFromBlob(f)
    let encrypted = await utils.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    let encryptedFileName = await utils.encryptedFileName(f.name, encrypted.iv, encrypted.key);
    await dropbox.upload(this.dbx, blob, encryptedFileName);
    let {url: shareLink} = await dropbox.getSharedLink(this.dbx, encryptedFileName);
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
