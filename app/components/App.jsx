import React from 'react';
import Dropbox from 'dropbox';
import base32 from 'hi-base32';

export default class App extends React.Component {
  dbx = new Dropbox({accessToken: ''})

  async encrypt(buffer) {
    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let key = await window.crypto.subtle.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
    let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, buffer);
    let jwk = await window.crypto.subtle.exportKey("jwk", key);

    return {iv, jwk: jwk.k, encrypted, key}
  }

  async decrypt(buffer, jwk, iv) {
    let importedKey = await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);
    let decrypted = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, importedKey, buffer);

    return decrypted
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

  async downloadFromDropbox(fileName) {
    let response = await this.dbx.filesDownload({
      path: `/${fileName}`
    });
    return response
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

  onFileInputChange = async ({target: {files}}) => {
    let f = files[0];
    let result = await this.bufferFromBlob(f)
    let encrypted = await this.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    let encryptedFileName = await this.encryptedFileName(f.name, encrypted.iv, encrypted.key);
    let decryptedFileName = await this.decryptedFileName(encryptedFileName, encrypted.iv, encrypted.key);
    await this.uploadToDropbox(blob, encryptedFileName);
    let {fileBlob} = await this.downloadFromDropbox(encryptedFileName, encrypted.iv, encrypted.key);
    let decrypted = await this.decrypt(await this.bufferFromBlob(fileBlob), encrypted.jwk, encrypted.iv);
    let decryptedBlob = new Blob([decrypted]);
    this.saveToDisk(decryptedBlob, `decrypted ${decryptedFileName}`)
  };

  render() {
    return (
      <div id="content">
        <span>Select a file to upload:</span>
        <input type='file' onChange={this.onFileInputChange}/>
      </div>
    );
  }
}
