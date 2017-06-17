import React from 'react';
import PropTypes from 'prop-types';
import utils from '../utils';
import Status from './Status';

export default class DownloadPage extends React.Component {
  static propTypes = {
    jwk: PropTypes.string.isRequired,
    iv: PropTypes.string.isRequired,
    shareLink: PropTypes.string.isRequired,
    filename: PropTypes.string.isRequired,
  };

  state = {loading: true, downloaded: false, status: ''};
  key = null;
  share = null;

  async getKey() {
    if(!this.key) this.key = await utils.importKey(this.props.jwk);
    return this.key
  }

  downloadFile = async () => {
    try {
      this.setState({status: 'Downloading'});
      let fileBlob = await utils.dropbox.download(this.share.shareLink);
      this.setState({status: 'Decrypting'});
      let decrypted = await utils.decrypt(await utils.bufferFromBlob(fileBlob), await this.getKey(), this.share.iv);
      utils.saveToDisk(new Blob([decrypted]), this.decryptedFilename);
      this.setState({downloaded: true, status: 'Done!'})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred', loading: false});
      throw e
    }
  };

  async componentDidMount() {
    try {
      this.share = {...this.props, iv: new Uint8Array(JSON.parse(this.props.iv))};

      if (!this.share) return this.setState({loading: false});
      this.decryptedFilename = await utils.decryptedFilename(this.share.filename, this.share.iv, await this.getKey());
      this.setState({filename: this.decryptedFilename, loading: false})
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
    if(this.state.filename) {
      return (
        <div>
          <div>{this.state.filename}</div>
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
