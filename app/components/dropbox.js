const download = async function(shareLink) {
  let coreLink = shareLink.match(/\/s\/(.*)\?/)[1];
  let response = await fetch(`https://dl.dropboxusercontent.com/1/view/${coreLink}`);
  return await response.blob()
};

export default {download};
