import 'babel-polyfill';
import SharesController from '../controllers/SharesController';
import router from '../router';

export default (event, context) => router(event, context, SharesController)
