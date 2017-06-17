const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: isProduction ? 'bundle-[chunkhash].js' : 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: path.resolve(__dirname, 'node_modules/'),
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
      }
    ]
  },
  resolve: {
    extensions: ['.scss', '.jsx', '.js', '.ts', '.tsx', '.json']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './assets/index.html'
    })
  ],
  devServer: {
    port: 8081,
    historyApiFallback: true
  },
  devtool: isProduction ? false : 'source-map'
};