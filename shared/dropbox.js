import Dropbox from 'dropbox';

const client = (accessToken) => {
  return new Dropbox({accessToken})
};

const download = async (shareLink) => {
  let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
  let response = await fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`);

  if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
  return response.blob()
};

const upload = (accessToken, blob, fileName) => {
  return client(accessToken).filesUpload({
    path: `/${fileName}`,
    contents: blob
  })
};

const getSharedLink = (accessToken, fileName) => {
  return client(accessToken).sharingCreateSharedLinkWithSettings({
    path: `/${fileName}`
  })
};

const deleteFile = (accessToken, fileName) => {
  return client(accessToken).filesDelete({
    path: `/${fileName}`
  })
};

export default {download, upload, getSharedLink, deleteFile};
