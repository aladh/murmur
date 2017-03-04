import Dropbox from 'dropbox';

const client = (accessToken) => {
  return new Dropbox({accessToken})
};

const download = async function(accessToken, fileName) {
  return await client(accessToken).filesDownload({
      path: `/${fileName}`
  })
};

const upload = async function(accessToken, blob, fileName) {
  return await client(accessToken).filesUpload({
    path: `/${fileName}`,
    contents: blob
  })
};

export default {download, upload};
