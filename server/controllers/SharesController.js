import sharesTable from '../models/sharesTable';
import BaseController from './BaseController';

export default class SharesController extends BaseController {
  create = () => {
    this.tryCatch(async () => {
      let item = {...this.req.body, iv: new Uint8Array(this.req.body.iv)};
      await sharesTable.putItem(item.id, item.iv, item.fileName, item.accessToken, item.shareLink);
      this.res.send()
    });
  };

  show = () => {
    this.tryCatch(async () => {
      let item = await sharesTable.getItem(this.req.pathParameters.id);
      item.iv = Array.from(item.iv);
      this.res.send(item)
    }, (e) => e.message.includes('SharesTable') ? 404 : 500);
  };

  destroy = () => {
    this.tryCatch(async () => {
      await sharesTable.deleteItem(this.req.pathParameters.id);
      this.res.send()
    })
  }
}
