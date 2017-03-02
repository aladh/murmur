'use strict';

const sharesTable = require('resources/SharesTable');

exports.handler = (event, context, callback) => {
	sharesTable.deleteItem(event.pathParameters.id)
		.then(() => {
	    context.succeed({
	      "statusCode": 200,
		    "headers": {'Access-Control-Allow-Origin': 'https://biimer.com'},
	      "body": "" 
	    })
		})
		.catch(err => {
	    context.succeed({
	      "statusCode": 500,
	      "headers": {'Access-Control-Allow-Origin': 'https://biimer.com'},
	      "body": JSON.stringify(err)
	    })
		})
};
