import React from 'react';
import utils from '../utils';
import Status from './Status';

const STATUS_DONE = 'Done!';

export default class UploadPage extends React.Component<{dropboxAccessToken: string}, {status: string}> {
  state = {status: ''};
  iv: string = null;
  filename: string = null;
  key: string = null;
  shareLink: string = null;

  uploadFile = async ({target: {files}}: { target: HTMLInputElement }) => {
    try {
      let file = files[0];
      this.setState({status: 'Encrypting'});
      let {iv, jwk, encrypted, key} = await utils.encrypt(await utils.bufferFromBlob(file));

      let encryptedFilename = await utils.encryptedFilename(file.name, (iv as Uint8Array), key);
      this.setState({status: 'Uploading'});
      await utils.dropbox.upload(this.props.dropboxAccessToken, new Blob([encrypted]), encryptedFilename);

      this.iv = JSON.stringify(Array.from((iv as Uint8Array)));
      this.filename = encryptedFilename;
      this.key = jwk;
      this.shareLink = await utils.dropbox.getDownloadLink(this.props.dropboxAccessToken, encryptedFilename);

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
        <input value={`${utils.baseURL}#${params.toString()}`} onClick={({target}) => (target as HTMLInputElement).select()} readOnly/>
      </div>
    )
  }

  render() {
    return (
      <div className="upload-page">
        <h3>Upload a file</h3>
        <input type='file' onChange={this.uploadFile} />
        <br/>
        <br/>
        <Status message={this.state.status} />
        <br/>
        {this.renderShareLink()}
      </div>
    );
  }
}
