import React from 'react';

export default class App extends React.Component {
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

  onFileInputChange = async ({target: {files}}) => {
    let f = files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(f);
    await new Promise((resolve) => setTimeout(() => {if(reader.readyState == 2) resolve()}, 100));
    let {result} = reader;
    let encrypted = await this.encrypt(result);
    let decrypted = await this.decrypt(encrypted.encrypted, encrypted.jwk, encrypted.iv);
    let blob = new Blob([decrypted]);
    this.saveToDisk(blob, `decrypted ${f.name}`)
  };

  render() {
    return (
      <div id="content">
        <input type='file' onChange={this.onFileInputChange}/>
      </div>
    );
  }
}
