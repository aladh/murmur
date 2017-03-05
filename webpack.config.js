const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const isProduction = process.env.NODE_ENV == 'production';

module.exports = {
  entry: {
    client: './client/initialize'
  },
  output: {
    filename: isProduction ? '[name]-[chunkhash].js' : '[name].js',
    path: path.resolve(__dirname, 'dist'),
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
