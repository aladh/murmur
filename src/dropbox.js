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

const upload = (accessToken, blob, filename) => {
  return client(accessToken).filesUpload({
    path: `/${filename}`,
    contents: blob
  })
};

const getSharedLink = (accessToken, filename) => {
  return client(accessToken).sharingCreateSharedLinkWithSettings({
    path: `/${filename}`
  })
};

const deleteFile = (accessToken, filename) => {
  return client(accessToken).filesDelete({
    path: `/${filename}`
  })
};

export default {download, upload, getSharedLink, deleteFile};
