const download = async function(shareLink) {
  let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
  let response = await fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`);
  return await response.blob()
};

const upload = async function(client, blob, fileName) {
  let response = await client.filesUpload({
    path: `/${fileName}`,
    contents: blob
  });
  return response
};

const getSharedLink = async function(client, fileName) {
  return await client.sharingCreateSharedLinkWithSettings({
      path: `/${fileName}`
  })
};

export default {download, upload, getSharedLink};
