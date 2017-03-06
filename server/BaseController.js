import 'babel-polyfill';
import bugsnag from 'bugsnag';
import secrets from './secrets';

export default class BaseController {
  constructor() {
    bugsnag.register(secrets.bugsnagApiKey)
  }

  // private

  async tryCatch(context, fn, errCodeFn = () => 500) {
    try {
      await fn()
    } catch(e) {
      this.notifyError(e);

      context.succeed({
        statusCode: errCodeFn(e),
        headers: this.defaultHeaders(),
        body: JSON.stringify(e)
      })
    }
  }

  notifyError(e) {
    bugsnag.notify(e)
  }

  defaultHeaders() {
    return {'Access-Control-Allow-Origin': '*'}
  }

  successResponse(body = '') {
    return {
      statusCode: 200,
      headers: this.defaultHeaders(),
      body: body ? JSON.stringify(body) : body
    }
  }
}
