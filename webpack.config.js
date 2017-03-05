const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './client/initialize',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
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
      hash: true,
      template: './client/assets/index.html'
    })
  ]
};
