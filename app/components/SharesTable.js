import DynamoDB from 'aws-sdk/clients/dynamodb';
import secrets from '../secrets';

export default class SharesTable {
  client = new DynamoDB({
    apiVersion: '2012-08-10',
    params: {TableName: 'shares'},
    region: 'us-east-1',
    credentials: {
      accessKeyId: secrets.awsAccessKeyId,
      secretAccessKey: secrets.awsSecretAccessKey
    }
  });

  putItem(id, iv, fileName, accessToken) {
    let item = {
      id: {S: id},
      iv: {B: iv},
      fileName: {S: fileName},
      accessToken: {S: accessToken},
      createdAt: {N: Date.now().toString()},
      provider: {S: 'dropbox'}
    };

    return new Promise((resolve, reject) => {
      this.client.putItem({Item: item}, (err, data) =>  {
        err ? reject(err) : resolve(data)
      })
    })
  }

  getItem(id) {
    return new Promise((resolve, reject) => {
      this.client.getItem({Key: {id: {S: id}}}, (err, data) => {
        if(err) {
          reject(err)
        } else if(Object.keys(data).length > 0) {
          resolve(this.parseItem(data))
        } else {
          reject('DynamoDB: Item not found')
        }
      })
    })
  }

  deleteItem(id) {
    return new Promise((resolve, reject) => {
      this.client.deleteItem({Key: {id: {S: id}}}, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  parseItem({Item: item}) {
    let o = {};

    Object.keys(item).forEach((k) => {
      o[k] = item[k][Object.keys(item[k])[0]]
    });

    return o;
  }
}
