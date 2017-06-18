import React from 'react';
import utils from '../utils';
import Status from './Status';

interface Props {
  jwk: string;
  iv: string;
  shareLink: string;
  filename: string;
}

interface State {
  loading: boolean;
  downloaded: boolean;
  status: string;
  filename: string;
}

export default class DownloadPage extends React.Component<Props, State> {
  state = {loading: true, downloaded: false, status: '', filename: ''};
  key: CryptoKey = null;
  decryptedFilename: string = null;

  async getKey() {
    if(!this.key) this.key = await utils.importKey(this.props.jwk);
    return this.key
  }

  downloadFile = async () => {
    try {
      this.setState({status: 'Downloading'});
      let fileBlob = await utils.dropbox.download(this.props.shareLink);
      this.setState({status: 'Decrypting'});
      let decrypted = await utils.decrypt(await utils.bufferFromBlob(fileBlob), await this.getKey(), new Uint8Array(JSON.parse(this.props.iv)));
      utils.saveToDisk(new Blob([decrypted]), this.decryptedFilename);
      this.setState({downloaded: true, status: 'Done!'})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred', loading: false});
      throw e
    }
  };

  async componentDidMount() {
    try {
      if (!this.key) return this.setState({loading: false});
      this.decryptedFilename = await utils.decryptedFilename(this.props.filename, new Uint8Array(JSON.parse(this.props.iv)), await this.getKey());
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
