import React from 'react';
import Dropbox from 'dropbox';
import utils from './utils';
import Status from './Status';

export default class DownloadPage extends React.Component {
  static contextTypes = {
    sharesTable: React.PropTypes.object.isRequired
  };

  state = {loading: true, downloaded: false, status: ''};

  linkId() {
    return location.pathname.slice(3)
  }

  async getKey() {
    if(!this.key) this.key = await utils.importKey(location.hash.slice(1));
    return this.key
  }

  async deleteFile(dropboxClient) {
    await utils.dropbox.deleteFile(dropboxClient, this.fileData.fileName);
    await this.context.sharesTable.deleteItem(this.fileData.id)
  }

  downloadFile = async () => {
    let dropboxClient = new Dropbox({accessToken: this.fileData.accessToken})
    this.setState({status: 'Downloading'});
    let {fileBlob} = await utils.dropbox.download(dropboxClient, this.fileData.fileName);
    this.setState({status: 'Decrypting'});
    let decrypted = await utils.decrypt(await utils.bufferFromBlob(fileBlob), await this.getKey(), this.fileData.iv);
    this.deleteFile(dropboxClient);
    utils.saveToDisk(new Blob([decrypted]), this.decryptedFileName);
    this.setState({downloaded: true, status: 'Done!'})
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
    if(!this.state.downloaded) {
      return <button onClick={this.downloadFile}>Download</button>
    }
  }

  renderDownloadSection() {
    if(this.state.fileName) {
      return (
        <div>
          <div>{this.state.fileName}</div>
          {this.renderDownloadButton()}
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
          {this.renderDownloadSection()}
        </div>
        <div />
        <Status message={this.state.status} />
      </div>
    )
  }
}
