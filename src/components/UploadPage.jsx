import React from 'react';
import PropTypes from 'prop-types';
import utils from '../utils';
import Status from './Status';

const STATUS_DONE = 'Done!';

export default class UploadPage extends React.Component {
  static propTypes = {dropboxAccessToken: PropTypes.string.isRequired};

  state = {status: ''};
  iv = null;
  filename = null;
  key = null;
  shareLink = null;


  uploadFile = async ({target: {files}}) => {
    try {
      let [file] = files;
      this.setState({status: 'Encrypting'});
      let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

      let encryptedFilename = await utils.encryptedFilename(file.name, iv, key);
      this.setState({status: 'Uploading'});
      await utils.dropbox.upload(this.props.dropboxAccessToken, new Blob([encrypted]), encryptedFilename);

      let {url: shareLink} = await utils.dropbox.getSharedLink(this.props.dropboxAccessToken, encryptedFilename);

      this.iv = JSON.stringify(Array.from(iv));
      this.filename = encryptedFilename;
      this.key = jwk;
      this.shareLink = shareLink;

      this.setState({status: STATUS_DONE})
    } catch(e) {
      await this.setState({status: 'An unexpected error occurred'});
      throw e
    }
  };

  renderShareLink() {
    if (this.state.status !== STATUS_DONE) return;

    let params = new URLSearchParams();
    params.set('iv', this.iv);
    params.set('filename', this.filename);
    params.set('key', this.key);
    params.set('shareLink', this.shareLink);

    return (
      <div>
        <span>Your share link is: </span>
        <input value={`${utils.baseURL()}#${params.toString()}`} onClick={e => e.target.select()} readOnly/>
      </div>
    )
  }

  render() {
    return (
      <div className="upload-page">
        <h3>Upload a file</h3>
        <input type='file' onChange={this.uploadFile}/>
        <br/>
        <br/>
        <Status message={this.state.status} />
        <br/>
        {this.renderShareLink()}
      </div>
    );
  }
}
