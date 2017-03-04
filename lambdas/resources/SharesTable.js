'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const secrets =  require('./secrets');

class SharesTable {
  constructor() {
    this.client = new DynamoDB({
      apiVersion: '2012-08-10',
      params: {TableName: 'shares'},
      region: 'us-east-1',
      credentials: {
        accessKeyId: secrets.awsAccessKeyId,
        secretAccessKey: secrets.awsSecretAccessKey
      }
    })
  }

  putItem(id, iv, fileName, accessToken) {
    let item = {
      id: {S: id},
      iv: {B: iv},
      fileName: {S: fileName},
      accessToken: {S: accessToken},
      createdAt: {N: this.unixTime()},
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

  // PRIVATE

  parseItem(data) {
    let o = {};
    let item = data.Item;

    Object.keys(item).forEach((k) => {
      o[k] = item[k][Object.keys(item[k])[0]]
    });

    return o;
  }

  unixTime() {
    return Math.floor(Date.now() / 1000)
  }
}

module.exports = new SharesTable();
