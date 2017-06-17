import DropboxSDK from 'dropbox';
import Storage from './Storage';

const client = (accessToken: string) => {
  return new DropboxSDK({accessToken})
};

class Dropbox implements Storage {
  async download(shareLink: string) {
    const baseLink = shareLink.match(/\/s\/(.*)\?/)[1];
    const response = await fetch(`https://dl.dropboxusercontent.com/1/view/${baseLink}`);

    if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
    return response.blob()
  }

  // TODO: Check for error (like download)?
  upload(accessToken: string, blob: Blob, filename: string) {
    return client(accessToken).filesUpload({
      path: `/${filename}`,
      contents: blob
    })
  }

  async getDownloadLink(accessToken: string, filename: string) {
    const response = await client(accessToken).sharingCreateSharedLinkWithSettings({path: `/${filename}`});
    return response.url
  };
}

export default new Dropbox()