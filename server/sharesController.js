import sharesTable from './sharesTable';

class SharesController {
  create(event, context) {
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
  }

  show(event, context) {
    sharesTable.getItem(event.pathParameters.id)
      .then((item) => {
        item.iv = Array.from(item.iv);

        context.succeed({
          "statusCode": 200,
          "headers": {'Access-Control-Allow-Origin': '*'},
          "body": JSON.stringify(item)
        })
      })
      .catch(err => {
        context.succeed({
          "statusCode": err.message.includes('SharesTable') ? 404 : 500,
          "headers": {'Access-Control-Allow-Origin': '*'},
          "body": JSON.stringify(err)
        })
      })
  }

  destroy(event, context) {
    sharesTable.deleteItem(event.pathParameters.id)
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
  }
}

export default new SharesController()
