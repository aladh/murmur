import sharesTable from 'resources/SharesTable';

const handler = (event, context) => {
	sharesTable.deleteItem(event.pathParameters.id)
		.then(() => {
	    context.succeed({
	      "statusCode": 200,
		    "headers": {'Access-Control-Allow-Origin': '*'},
	      "body": "" 
	    })
		})
		.catch(err => {
	    context.succeed({
	      "statusCode": 500,
	      "headers": {'Access-Control-Allow-Origin': '*'},
	      "body": JSON.stringify(err)
	    })
		})
};

export {handler as handler}
