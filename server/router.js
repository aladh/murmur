import {create, show, destroy} from 'controllers/SharesController';
import bugsnag from 'bugsnag';
import secrets from './secrets';

const createResponse = (responseFn) => {
  let response = {
    code: 200,
    status: (code) => {
      response.code = code;
      return response
    },
    send: (body) => {
      responseFn({
        statusCode: response.code,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: body ? JSON.stringify(body): undefined
      })
    },
    end: () => response.send()
  };

  return response
};

export default async (event, context) => {
  try {
    let req = {...event, body: JSON.parse(event.body)};
    let res = createResponse(context.succeed);

    if (event.resource == '/{id}' && event.httpMethod == 'GET') {
      await show(req, res)
    } else if (event.resource == '/{id}' && event.httpMethod == 'DELETE') {
      await destroy(req, res)
    } else if (event.resource == '/' && event.httpMethod == 'POST') {
      await create(req, res)
    }
  } catch(e) {
    bugsnag.register(secrets.bugsnagApiKey);
    bugsnag.notify(e, {
      request: event
    });

    context.succeed({
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'}
    })
  }
}
