import React from 'react';
import base32 from 'hi-base32';

export default class DownloadPage extends React.Component {
  state = {fileName: ''};

  async importKey(jwk) {
    return await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
  }

  async decryptedFileName(encryptedFileName, iv, key) {
    let encryptedText = base32.decode(encryptedFileName);
    let encryptedBuffer = new Uint8Array(encryptedText.split('').map(ch => ch.charCodeAt(0)));
    let decryptedBuffer = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedBuffer);

    return new TextDecoder().decode(decryptedBuffer)
  }

  async downloadFromDropbox(shareLink) {
    let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
    return fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`)
  }

  async decrypt(buffer, key, iv) {
    return await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, buffer);
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

  linkId() {
    return location.pathname.slice(3)
  }

  key() {
    return location.hash.slice(1)
  }

  downloadFile = async () => {
    let fileData = JSON.parse(sessionStorage.getItem(this.linkId()));
    fileData.iv = Uint8Array.from(fileData.iv);
    let key = await this.importKey(this.key());
    let decryptedFileName = await this.decryptedFileName(fileData.fileName, fileData.iv, key);
    let {body: readableStream} = await this.downloadFromDropbox(fileData.link);
    let data = await this.readStream(readableStream);
    let decrypted = await this.decrypt(data, key, fileData.iv);
    let decryptedBlob = new Blob([decrypted]);
    this.saveToDisk(decryptedBlob, `decrypted ${decryptedFileName}`)
  }

  render() {
    return (
      <div>
        <div>{this.state.fileName}</div>
        <button onClick={this.downloadFile}>Download</button>
      </div>
    )
  }
}
