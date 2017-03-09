import bugsnag from 'bugsnag';
import secrets from '../secrets';

export default class BaseController {
  constructor(req, res) {
    this.req = {...req, body: JSON.parse(req.body)};
    this.res = this.createResponse(res.succeed);
  }

  // private

  createResponse(responseFn) {
    let response = {
      code: 200,
      status: (code = 200) => {
        response.code = code;
        return response
      },
      send: (body = '') => {
        responseFn({
          statusCode: response.code,
          headers: {'Access-Control-Allow-Origin': '*'},
          body: JSON.stringify(body)
        })
      }
    };

    return response
  }

  async tryCatch(fn, errCodeFn = () => 500) {
    try {
      await fn()
    } catch(e) {
      let code = errCodeFn(e);
      if (code > 499) this.notifyError(e);
      this.res.status(code).send()
    }
  }

  notifyError(e) {
    bugsnag.register(secrets.bugsnagApiKey);
    bugsnag.notify(e);
    console.error(`Error: ${JSON.stringify(e)}`);
    console.error(`Failed to process request: ${JSON.stringify(this.req)}`)
  }
}
