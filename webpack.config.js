/* eslint-env es6 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Dotenv = require('dotenv-webpack');

require('dotenv').config({ path: path.resolve(__dirname, './build/.env') });

const {
    NODE_ENV = 'production',
} = process.env;

module.exports = {
    entry: './build/server.js',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
        clean: true
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: [nodeExternals()],
    plugins: [
        new Dotenv({
            path: './build/.env'
        })
    ],
    devtool: process.env.WEBPACK_DEVTOOL
}