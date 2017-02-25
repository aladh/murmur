import React from 'react';
import utils from './utils';
import dropbox from './dropbox';

export default class DownloadPage extends React.Component {
  static contextTypes = {
    sharesTable: React.PropTypes.object.isRequired
  };

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

  async componentDidMount() {
    this.fileData = await this.context.sharesTable.getItem(this.linkId());
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
