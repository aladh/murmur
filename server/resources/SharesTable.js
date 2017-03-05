'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const secrets = require('./secrets');

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

  putItem(id, iv, fileName, accessToken, shareLink) {
    let item = {
      id: {S: id},
      iv: {B: iv},
      fileName: {S: fileName},
      accessToken: {S: accessToken},
      createdAt: {N: this.unixTime().toString()},
      expireAt: {N: this.defaultExpirationTime().toString()},
      provider: {S: 'dropbox'},
      shareLink: {S: shareLink}
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
          let item = this.parseItem(data);
          this.expired(item) ? reject({message: 'SharesTable: Item has expired'}) : resolve(this.filterPublicAttributes(item))
        } else {
          reject({message: 'SharesTable: Item not found'})
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

  filterPublicAttributes(item) {
    return {
      id: item.id,
      iv: item.iv,
      fileName: item.fileName,
      shareLink: item.shareLink,
    }
  }

  expired(item) {
    return this.unixTime() > item.expireAt
  }

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

  defaultExpirationTime() {
    // 7 days from now
    return this.unixTime() + 604800
  }
}

module.exports = new SharesTable();
