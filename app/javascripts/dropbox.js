import Dropbox from 'dropbox';

const client = (accessToken) => {
  return new Dropbox({accessToken})
};

const download = async function(shareLink) {
  let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
  let response = await fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`);
  return response.blob()
};

const upload = async function(accessToken, blob, fileName) {
  return await client(accessToken).filesUpload({
    path: `/${fileName}`,
    contents: blob
  })
};

const getSharedLink = async function(accessToken, fileName) {
  return await client(accessToken).sharingCreateSharedLinkWithSettings({
    path: `/${fileName}`
  })
};

export default {download, upload, getSharedLink};
