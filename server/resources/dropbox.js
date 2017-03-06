import Dropbox from 'dropbox';

const client = (accessToken) => {
  return new Dropbox({accessToken})
};

const deleteFile = (accessToken, fileName) => {
  return client(accessToken).filesDelete({
      path: `/${fileName}`
  })
};

export default {deleteFile}
