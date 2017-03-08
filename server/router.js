export default (event, context, controller) => {
  if (event.resource == '/{id}' && event.httpMethod == 'GET') {
    new controller(event, context).show()
  } else if (event.resource == '/{id}' && event.httpMethod == 'DELETE') {
    new controller(event, context).destroy()
  } else if (event.resource == '/' && event.httpMethod == 'POST') {
    new controller(event, context).create()
  } else {
    console.error('Unknown resource/method')
  }
}
