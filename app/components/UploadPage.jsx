import React from 'react';
import Dropbox from 'dropbox';
import base32 from 'hi-base32';
import utils from './utils';

export default class UploadPage extends React.Component {
  dbx = new Dropbox({accessToken: ''});
  state = {linkId: '', key: ''};

  async encrypt(buffer) {
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let key = await window.crypto.subtle.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
    let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, buffer);
    let jwk = await window.crypto.subtle.exportKey("jwk", key);

    return {iv, jwk: jwk.k, encrypted, key}
  }

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

  async encryptedFileName(fileName, iv, key) {
    let encryptedBuffer = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, new TextEncoder().encode(fileName));
    let encryptedBufferArray = Array.from(new Uint8Array(encryptedBuffer));
    let encryptedString = encryptedBufferArray.map(byte => String.fromCharCode(byte)).join('');

    return base32.encode(encryptedString)
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder('utf-8').encode(message);                     // encode as UTF-8
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);            // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer));                       // convert ArrayBuffer to Array
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join(''); // convert bytes to hex string
    return hashHex;
}

  uploadFile = async ({target: {files}}) => {
    let f = files[0];
    let result = await utils.bufferFromBlob(f)
    let encrypted = await this.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    let encryptedFileName = await this.encryptedFileName(f.name, encrypted.iv, encrypted.key);
    await this.uploadToDropbox(blob, encryptedFileName);
    let {url: shareLink} = await this.getSharedDropboxLink(encryptedFileName);
    let linkId = await this.sha256(encryptedFileName);
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
