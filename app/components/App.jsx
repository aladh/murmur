import React from 'react';

export default class App extends React.Component {
  state = {data: '', encrypted: '', decrypted: ''};

  componentDidMount() {
    this.refs.input.focus()
  }

  onInputChange = async ({target: {value}}) => {
    await this.setState({data: parseInt(value)});

    let buffer = new ArrayBuffer(4);
    let dataView = new DataView(buffer);

    dataView.setUint8(0, value);

    let iv = window.crypto.getRandomValues(new Uint8Array(12));
    let key = await window.crypto.subtle.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]);
    let encrypted = await window.crypto.subtle.encrypt({name: "AES-GCM", iv: iv}, key, dataView);

    this.setState({encrypted: new DataView(encrypted).getUint8()});

    let jwk = await window.crypto.subtle.exportKey("jwk", key);

    let importedKey = await window.crypto.subtle.importKey("jwk", {kty: "oct", k: jwk.k, alg: "A256GCM", ext: true}, {name: "AES-GCM"}, false, ["encrypt", "decrypt"]);

    let decrypted = await window.crypto.subtle.decrypt({name: "AES-GCM", iv: iv}, importedKey, encrypted);

    this.setState({decrypted: new DataView(decrypted).getUint8()});
  };

  render() {
    return (
      <div id="content">
        <input ref='input' value={this.state.data} onChange={this.onInputChange} />
        <span>{this.state.encrypted}</span>
        <span style={{marginLeft: '10px'}}>{this.state.decrypted}</span>
      </div>
    );
  }
}
