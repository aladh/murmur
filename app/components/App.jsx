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

    return {iv, jwk: jwk.k, encrypted}
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
      path: `/${this.encryptedFileName(fileName)}`,
      contents: blob
    });
    return response
  }

  async downloadFromDropbox(fileName) {
    let response = await this.dbx.filesDownload({
      path: `/${this.encryptedFileName(fileName)}`
    });
    return response
  }

  async encryptedFileName(fileName, iv, key) {
    let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, new TextEncoder().encode(fileName));

    const ctArray = Array.from(new Uint8Array(encrypted));                              // ciphertext as byte array
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');

    let base32EncryptedText = base32.encode(ctStr);
    let encryptedTextFromBase32 = base32.decode(base32EncryptedText);

    let encryptedBuffer = new Uint8Array(ctStr.split('').map(ch => ch.charCodeAt(0)))

    let decrypted = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, key, encryptedBuffer);

    let decryptedFileName = new TextDecoder().decode(decrypted)

    return base32EncryptedText
  }

  async bufferFromBlob(blob) {
    let reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    await new Promise((resolve) => setTimeout(() => {if(reader.readyState == 2) resolve()}, 100));
    return reader.result
  }

  onFileInputChange = async ({target: {files}}) => {
    let f = files[0];
    let result = await this.bufferFromBlob(f)
    let encrypted = await this.encrypt(result);
    let blob = new Blob([encrypted.encrypted]);
    await this.uploadToDropbox(blob, f.name);
    let {fileBlob} = await this.downloadFromDropbox(f.name);
    let decrypted = await this.decrypt(await this.bufferFromBlob(fileBlob), encrypted.jwk, encrypted.iv);
    // let decrypted = await this.decrypt(encrypted.encrypted, encrypted.jwk, encrypted.iv);
    let decryptedBlob = new Blob([decrypted]);
    this.saveToDisk(decryptedBlob, `decrypted ${f.name}`)
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
