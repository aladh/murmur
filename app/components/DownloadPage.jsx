import React from 'react';
import utils from './utils';
import dropbox from './dropbox';

export default class DownloadPage extends React.Component {
  state = {fileName: ''};

  linkId() {
    return location.pathname.slice(3)
  }

  async getKey() {
    if(!this.key) this.key = await utils.importKey(location.hash.slice(1));
    return this.key
  }

  downloadFile = async () => {
    let data = await dropbox.download(this.fileData.link);
    let decrypted = await utils.decrypt(await utils.bufferFromBlob(data), await this.getKey(), this.fileData.iv);
    utils.saveToDisk(new Blob([decrypted]), `decrypted ${this.decryptedFileName}`)
  }

  getItem(id) {
    return new Promise((resolve, reject) => {
      this.props.shares.getItem({Key: {id: {S: id}}}, (err, data) => {
        data ? resolve(this.parseItem(data)) : reject(err)
      })
    })
  }

  parseItem({Item: item}) {
    let o = {};
    Object.keys(item).forEach((k) => {
      o[k] = item[k][Object.keys(item[k])[0]]
    });
    return o;
  }

  async componentDidMount() {
    this.fileData = await this.getItem(this.linkId());
    this.decryptedFileName = await utils.decryptedFileName(this.fileData.fileName, this.fileData.iv, await this.getKey());
    this.setState({fileName: this.decryptedFileName})
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
