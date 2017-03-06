import sharesTable from './sharesTable';
import BaseController from './BaseController';

class SharesController extends BaseController {
  async create(event, context) {
    await this.tryCatch(context, async () => {
      let item = JSON.parse(event.body);
      item.iv = new Uint8Array(item.iv);

      await sharesTable.putItem(item.id, item.iv, item.fileName, item.accessToken, item.shareLink);

      context.succeed(this.successResponse());
    });
  }

  async show(event, context) {
    await this.tryCatch(context, async () => {
      let item = await sharesTable.getItem(event.pathParameters.id);
      item.iv = Array.from(item.iv);

      context.succeed(this.successResponse(item));
    }, (e) => e.message.includes('SharesTable') ? 404 : 500);
  }

  async destroy(event, context) {
    await this.tryCatch(context,  async () => {
      await sharesTable.deleteItem(event.pathParameters.id);
      context.succeed(this.successResponse())
    })
  }
}

export default new SharesController()
