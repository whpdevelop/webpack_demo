const webpack = require('webpack');
const path = require('path');
const getEntry = require('./getEntry.js');
const complie = require('./complie.js');
const alias = require('../app/plugin_alias.js');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

const containerPath = path.resolve('./');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractSASS = new ExtractTextPlugin('[name].css');

// 读取系统配置
let globalConfig = require('../app/global.config.json');

globalConfig = complie(globalConfig);

// 获取所有js入口
const entrys = getEntry('./app/src/*/*/*.js');
// 获取所有页面
const pages = getEntry('./app/src/*/*/*.pug');

// webpack处理的插件
const plugins = [];
plugins.push(extractSASS);
// HMR 模块
plugins.push(new webpack.HotModuleReplacementPlugin());
plugins.push(
  new OpenBrowserPlugin({
    url: 'http://localhost:8066',
  })
);

// 处理pug页面
for (const chunkname in pages) {
  const conf = {
    filename: `${chunkname}.html`,
    template: pages[chunkname],
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: false,
    },
    chunks: [chunkname],
    hash: true,
    globalConfig,
  };
  plugins.push(new HtmlWebpackPlugin(conf));
}

function getFileName(name) {
  const arr = name.split('/');
  return `${arr[arr.length - 1]}.js`;
}

/**
 * 配置webpack
 */
const config = {
  entry: entrys,
  output: {
    path: path.resolve(containerPath, './app/www/'),
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loaders: ['babel-loader', 'eslint-loader'],
        exclude: /(node_modules)|(plugins)/,
      },
    ],
    loaders: [
      {
        test: /\.html$/,
        loader: 'raw',
      },
      {
        test: /\.scss$/,
        loader: extractSASS.extract(['css!postcss', 'sass']),
        exclude: /(node_modules)/,
      },
      {
        test: /\.css$/,
        loader: extractSASS.extract(['css!postcss']),
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file',
      },
      {
        test: /.pug$/,
        loader: 'pug',
        exclude: /(node_modules)|(plugins)/,
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'url-loader?limit=8192&name=img/[name].[ext]?[hash:8]',
        exclude: /(node_modules)/,
      },
      {
        test: /\.art$/,
        loader: 'art-template-loader',
        options: {
          // art-template options (if necessary)
          // @see https://github.com/aui/art-template
        },
      },
    ],
  },
  postcss: () => {
    return [require('autoprefixer')];
  },
  plugins,
  resolve: {
    alias,
    extensions: ['', '.js', '.css', '.scss', '.pug', '.png', '.jpg', '.svg'],
  },
  externals: {},
};
module.exports = config;
