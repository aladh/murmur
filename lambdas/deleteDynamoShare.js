'use strict';

const sharesTable = require('resources/SharesTable');

exports.handler = (event, context, callback) => {
	sharesTable.deleteItem(event.pathParameters.id)
		.then(() => {
	    context.succeed({
	      "statusCode": 200,
		    "headers": {},
	      "body": "" 
	    })
		})
		.catch(err => {
	    context.succeed({
	      "statusCode": 500,
	      "headers": {},
	      "body": ""
	    })
		})
};
