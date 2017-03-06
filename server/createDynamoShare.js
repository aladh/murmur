import sharesTable from './resources/SharesTable';

const handler = (event, context) => {
  let item = JSON.parse(event.body);
  item.iv = new Uint8Array(item.iv);

  sharesTable.putItem(item.id, item.iv, item.fileName, item.accessToken, item.shareLink)
    .then(() => {
      context.succeed({
        "statusCode": 200,
        "headers": {'Access-Control-Allow-Origin': '*'},
        "body": ""
      })
    })
    .catch(err => {
      context.succeed({
        "statusCode": 500,
        "headers": {'Access-Control-Allow-Origin': '*'},
        "body": JSON.stringify(err)
      })
    })
};

export {handler as handler}
