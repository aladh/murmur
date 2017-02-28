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

const deleteFile = async function(client, fileName) {
  return await client.filesDelete({
      path: `/${fileName}`
  })
};

export default {download, upload, deleteFile};
