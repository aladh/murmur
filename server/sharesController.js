import sharesTable from './sharesTable';
import BaseController from './BaseController';

class SharesController extends BaseController {
  create(event, context) {
    this.tryCatch(context, async () => {
      let item = JSON.parse(event.body);
      item.iv = new Uint8Array(item.iv);

      await sharesTable.putItem(item.id, item.iv, item.fileName, item.accessToken, item.shareLink);

      context.succeed(this.successResponse());
    });
  }

  show(event, context) {
    this.tryCatch(context, async () => {
      let item = await sharesTable.getItem(event.pathParameters.id);
      item.iv = Array.from(item.iv);

      context.succeed(this.successResponse(item));
    }, (e) => e.message.includes('SharesTable') ? 404 : 500);
  }

  destroy(event, context) {
    this.tryCatch(context,  async () => {
      await sharesTable.deleteItem(event.pathParameters.id);
      context.succeed(this.successResponse())
    })
  }
}

export default new SharesController()
