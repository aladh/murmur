import React from 'react';
import utils from './utils';

export default class DownloadPage extends React.Component {
  static contextTypes = {
    sharesTable: React.PropTypes.object.isRequired
  };

  state = {loading: true};

  linkId() {
    return location.pathname.slice(3)
  }

  async getKey() {
    if(!this.key) this.key = await utils.importKey(location.hash.slice(1));
    return this.key
  }

  downloadFile = async () => {
    let data = await utils.dropbox.download(this.fileData.link);
    let decrypted = await utils.decrypt(await utils.bufferFromBlob(data), await this.getKey(), this.fileData.iv);
    utils.saveToDisk(new Blob([decrypted]), `decrypted ${this.decryptedFileName}`)
  }

  async componentDidMount() {
    try {
      this.fileData = await this.context.sharesTable.getItem(this.linkId());
      this.decryptedFileName = await utils.decryptedFileName(this.fileData.fileName, this.fileData.iv, await this.getKey());
      this.setState({fileName: this.decryptedFileName, loading: false})
    } catch(e) {
      if(e == 'DynamoDB: Item not found') {
        this.setState({loading: false})
      } else {
        throw(e)
      }
    }
  }

  renderDownloadButton() {
    if(this.state.fileName) {
      return (
        <div>
          <div>{this.state.fileName}</div>
          <button onClick={this.downloadFile}>Download</button>
        </div>
      )
    } else {
      return <div>The file you are looking for no longer exists</div>
    }
  }

  render() {
    return (
      <div className='download-page'>
        <h3>Download File</h3>
        <div className={`download-section ${this.state.loading ? 'hidden' : ''}`}>
          {this.renderDownloadButton()}
        </div>
      </div>
    )
  }
}
