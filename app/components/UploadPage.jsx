import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';
import dropbox from './dropbox';
import secrets from '../secrets';

export default class UploadPage extends React.Component {
  dbx = new Dropbox({accessToken: secrets.dropboxAccessToken});
  state = {linkId: '', key: ''};

  uploadFile = async ({target: {files}}) => {
    let file = files[0];
    let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

    let encryptedFileName = await utils.encryptedFileName(file.name, iv, key);
    await dropbox.upload(this.dbx, new Blob([encrypted]), encryptedFileName);

    let {url: shareLink} = await dropbox.getSharedLink(this.dbx, encryptedFileName);
    let linkId = await utils.sha256(encryptedFileName);

    await this.setState({linkId: linkId, key: jwk})
    sessionStorage.setItem(linkId, JSON.stringify({iv: Array.from(iv), fileName: encryptedFileName, link: shareLink}))
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
