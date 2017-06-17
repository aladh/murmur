import React from 'react';
import utils from '../utils';
import Status from './Status';
import api from '../api';

export default class DownloadPage extends React.Component {
  static propTypes = {
    shareId: React.PropTypes.string.isRequired,
    jwk: React.PropTypes.string
  };

  state = {loading: true, downloaded: false, status: ''};

  async getKey() {
    if(!this.key) this.key = await utils.importKey(this.props.jwk);
    return this.key
  }

  async deleteFile() {
    try {
      await api.deleteShare(this.share.id)
    } catch(e) {
      Bugsnag.notify(e, {
        shareId: this.share.id
      });
    }
  }

  downloadFile = async () => {
    try {
      this.setState({status: 'Downloading'});
      let fileBlob = await utils.dropbox.download(this.share.shareLink);
      this.setState({status: 'Decrypting'});
      let decrypted = await utils.decrypt(await utils.bufferFromBlob(fileBlob), await this.getKey(), this.share.iv);
      this.deleteFile();
      utils.saveToDisk(new Blob([decrypted]), this.decryptedFileName);
      this.setState({downloaded: true, status: 'Done!'})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred', loading: false});
      throw e
    }
  };

  async loadShare() {
    try {
      let share = await api.getShare(this.props.shareId);
      return {...share, iv: new Uint8Array(share.iv)}
    } catch(e) {
      Bugsnag.notify(e);
      return null
    }
  }

  async componentDidMount() {
    try {
      this.share = await this.loadShare();
      if (!this.share) return this.setState({loading: false});
      this.decryptedFileName = await utils.decryptedFileName(this.share.fileName, this.share.iv, await this.getKey());
      this.setState({fileName: this.decryptedFileName, loading: false})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred', loading: false});
      throw e
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
        <br/>
        <Status message={this.state.status} />
      </div>
    )
  }
}
