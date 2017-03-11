import sharesTable from '../models/sharesTable';

const create = async(req, res) => {
  let item = {...req.body, iv: new Uint8Array(req.body.iv)};
  await sharesTable.putItem(item.id, item.iv, item.fileName, item.accessToken, item.shareLink);
  res.end()
};

const show = async(req, res) => {
  try {
    let item = await sharesTable.getItem(req.params.id);
    item.iv = Array.from(item.iv);
    res.send(item)
  } catch (e) {
    if (e.message.includes('SharesTable')) {
      res.status(404).end()
    } else {
      throw e
    }
  }
};

const destroy = async(req, res) => {
  await sharesTable.deleteItem(req.params.id);
  res.end()
};

export default {create, show, destroy}
