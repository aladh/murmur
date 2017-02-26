const download = async function(client, fileName) {
  return await client.filesDownload({
      path: `/${fileName}`
  })
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
