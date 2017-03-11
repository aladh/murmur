import {create, show, destroy} from './controllers/SharesController';
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

export default async ({resource, httpMethod, body, pathParameters}, {succeed}) => {
  try {
    let req = {
      body: JSON.parse(body),
      params: pathParameters
    };

    let res = createResponse(succeed);

    if (resource == '/{id}' && httpMethod == 'GET') {
      await show(req, res)
    } else if (resource == '/{id}' && httpMethod == 'DELETE') {
      await destroy(req, res)
    } else if (resource == '/' && httpMethod == 'POST') {
      await create(req, res)
    }
  } catch(e) {
    bugsnag.register(secrets.bugsnagApiKey);
    bugsnag.notify(e);

    succeed({
      statusCode: 500,
      headers: {'Access-Control-Allow-Origin': '*'}
    })
  }
}
