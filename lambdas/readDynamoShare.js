'use strict';

const sharesTable = require('resources/SharesTable');

exports.handler = (event, context, callback) => {
	sharesTable.getItem(event.pathParameters.id)
		.then((item) => {
			item.iv = Array.from(item.iv);
			
	    context.succeed({
	      "statusCode": 200,
		    "headers": {'Access-Control-Allow-Origin': '*'},
	      "body": JSON.stringify(item) 
	    })
		})
		.catch(err => {
			let statusCode = e.message.includes('SharesTable') ? 404 : 500;

	    context.succeed({
	      "statusCode": statusCode,
	      "headers": {'Access-Control-Allow-Origin': '*'},
	      "body": JSON.stringify(err)
	    })
		})
};