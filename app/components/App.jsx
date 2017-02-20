import React from 'react';

export default class App extends React.Component {
  state = {data: '', encrypted: '', decrypted: ''};

  componentDidMount() {
    this.refs.input.focus()
  }

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

  onInputChange = async ({target: {value}}) => {
    let dataView = new DataView(new ArrayBuffer(4));
    dataView.setUint8(0, value);

    let {iv, jwk, encrypted} = await this.encrypt(dataView);
    let decrypted = await this.decrypt(encrypted, jwk, iv);

    this.setState({
      data: parseInt(value),
      encrypted: new DataView(encrypted).getUint8(),
      decrypted: new DataView(decrypted).getUint8()
    });
  };

  onFileInputChange = async ({target: {files}}) => {
    let f = files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(f);
    await new Promise((resolve) => setTimeout(() => {if(reader.readyState == 2) resolve()}, 100));
    let {result} = reader;
    let encrypted = await this.encrypt(result);
    console.log(encrypted)
  };

  render() {
    return (
      <div id="content">
        <input ref='input' value={this.state.data} onChange={this.onInputChange} />
        <span>{this.state.encrypted}</span>
        <span style={{marginLeft: '10px'}}>{this.state.decrypted}</span>

        <div />
        <input type='file' onChange={this.onFileInputChange}/>
      </div>
    );
  }
}
