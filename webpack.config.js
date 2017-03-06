const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProduction = process.env.NODE_ENV == 'production';

let clientConfig = {
  entry: {
    client: './client/initialize'
  },
  output: {
    filename: isProduction ? '[name]-[chunkhash].js' : '[name].js',
    path: path.resolve(__dirname, isProduction ? 'dist/client' : 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /client.*\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                modules: false
              }],
              'stage-0',
              'react'
            ]
          }
        }
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.scss', '.jsx', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/assets/index.html'
    })
  ],
  devServer: {
    port: 8081,
    historyApiFallback: true
  }
};

let serverConfig = {
  entry: {
    createDynamoShare: './server/createDynamoShare'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/server')
  },
  module: {
    rules: [
      {
        test: /server.*\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['env', {
                modules: false,
                targets: {
                  node: 4.3
                }
              }],
              'stage-0'
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  target: 'node'
};

module.exports = [clientConfig, serverConfig];
