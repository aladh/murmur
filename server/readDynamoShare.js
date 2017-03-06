import sharesTable from 'resources/SharesTable';

const handler = (event, context) => {
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
	    context.succeed({
	      "statusCode": err.message.includes('SharesTable') ? 404 : 500,
	      "headers": {'Access-Control-Allow-Origin': '*'},
	      "body": JSON.stringify(err)
	    })
		})
};

export {handler as handler}
