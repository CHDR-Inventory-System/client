/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const plugins = [
    new Dotenv(),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx']
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
      title: 'CHDR Inventory'
    }),
    new MomentLocalesPlugin(),
    new CleanWebpackPlugin()
  ];

  if (env.analyze) {
    plugins.push(new BundleAnalyzerPlugin());
  }

  return {
    plugins,
    target: 'web',
    entry: path.resolve(__dirname, 'src', 'index.tsx'),
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'index.js',
      // During development, the project will be served on the path '/'
      // but we need to serve on the path '/csi' during production
      // so we can properly load static assets
      publicPath: argv.mode === 'production' ? '/csi/' : '/'
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      open: false,
      port: 9000,
      hot: true,
      historyApiFallback: true,
      proxy: {
        '/api': 'http://127.0.0.1:4565/'
      }
    },
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          include: path.resolve(__dirname, 'src'),
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
        },
        {
          // Using asset/resource will emit a separate file and export the
          // url. If you want svg to be imported inline, separate svg into a
          // new rule and use asset/inline for (data URI) or asset/source (for code).
          test: /\.(png|jpg|svg)/,
          type: 'asset/resource'
        }
      ]
    },
    resolve: {
      // Files without an extension will be treated as one of these.
      // Note that webpack will go from left to right until the proper
      // extension is found.
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    }
  };
};
