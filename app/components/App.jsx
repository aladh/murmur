import React from 'react';
import Dropbox from 'dropbox';
import base32 from 'hi-base32';

export default class App extends React.Component {
  dbx = new Dropbox({accessToken: ''})
  state = {linkId: '', key: ''};
  store = {};

  async encrypt(buffer) {
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let key = await window.crypto.subtle.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
    let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, buffer);
    let jwk = await window.crypto.subtle.exportKey("jwk", key);

    return {iv, jwk: jwk.k, encrypted, key}
  }

  async decrypt(buffer, key, iv) {
    return await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, buffer);
  }

  async importKey(jwk) {
    return await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
  }

  saveToDisk(blob, fileName) {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async uploadToDropbox(blob, fileName) {
    let response = await this.dbx.filesUpload({
      path: `/${fileName}`,
      contents: blob
    });
    return response
  }

  async downloadFromDropbox(shareLink) {
    let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
    return fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`)
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

  async decryptedFileName(encryptedFileName, iv, key) {
    let encryptedText = base32.decode(encryptedFileName);
    let encryptedBuffer = new Uint8Array(encryptedText.split('').map(ch => ch.charCodeAt(0)));
    let decryptedBuffer = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedBuffer);

    return new TextDecoder().decode(decryptedBuffer)
  }

  async bufferFromBlob(blob) {
    let reader = new FileReader();
    reader.readAsArrayBuffer(blob);

    await new Promise((resolve) => {
      let interval =
        setInterval(() => {
          if(reader.readyState == 2) {
            clearInterval(interval);
            resolve()
          }
        }, 100)
    });

    return reader.result
  }

  readStream(readableStream) {
    const reader = readableStream.getReader();
    let chunks = [];

    return pump();

    function pump() {
      return reader.read().then(({ value, done }) => {
        if (done) {
          return Uint8Array.from(chunks);
        }

        chunks = chunks.concat(Array.from(value));
        return pump();
      });
    }
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
    let result = await this.bufferFromBlob(f)
    let encrypted = await this.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    let encryptedFileName = await this.encryptedFileName(f.name, encrypted.iv, encrypted.key);
    await this.uploadToDropbox(blob, encryptedFileName);
    let {url: shareLink} = await this.getSharedDropboxLink(encryptedFileName);
    let linkId = await this.sha256(encryptedFileName);
    await this.setState({linkId: linkId, key: encrypted.jwk})
    this.store[linkId] = {iv: encrypted.iv, fileName: encryptedFileName, link: shareLink}
  };

  downloadFile = async () => {
    let fileData = this.store[this.refs.linkId.value];
    let key = await this.importKey(this.refs.key.value)
    let decryptedFileName = await this.decryptedFileName(fileData.fileName, fileData.iv, key);
    let {body: readableStream} = await this.downloadFromDropbox(fileData.link);
    let data = await this.readStream(readableStream);
    let decrypted = await this.decrypt(data, key, fileData.iv);
    let decryptedBlob = new Blob([decrypted]);
    this.saveToDisk(decryptedBlob, `decrypted ${decryptedFileName}`)
  }

  render() {
    return (
      <div id="content">
        <span>Select a file to upload:</span>
        <input type='file' onChange={this.uploadFile}/>
        <span>{`Your link ID is ${this.state.linkId}`}</span>
        <span>{` Your key is ${this.state.key}`}</span>
        <div />
        <span>{`Your share link is: http://localhost:3333/s/${this.state.linkId}#${this.state.key}`}</span>
        <div />
        <span>Enter link id and key to download:</span>
        <input ref='linkId' />
        <input ref='key' />
        <button onClick={this.downloadFile}>Download</button>
      </div>
    );
  }
}
