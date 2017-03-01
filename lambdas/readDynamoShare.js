'use strict';

const sharesTable = require('resources/SharesTable');

exports.handler = (event, context, callback) => {
	sharesTable.getItem(event.pathParameters.id)
		.then((item) => {
	    context.succeed({
	      "statusCode": 200,
		    "headers": {},
	      "body": JSON.stringify(item) 
	    })
		})
		.catch(err => {
	    context.succeed({
	      "statusCode": err == 'DynamoDB: Item not found' ? 404 : 500,
	      "headers": {},
	      "body": ""
	    })
		})
};