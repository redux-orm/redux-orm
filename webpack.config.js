var path = require('path');
var webpack = require('webpack');
var env = process.env.NODE_ENV === 'production'
    ? 'production'
    : 'development';

var outputFile;

if (env === 'production') {
    outputFile = 'redux-orm.min.js';
} else {
    outputFile = 'redux-orm.js';
}

module.exports = {
    entry: './src/index.js',
    devtool: 'source-map',
    mode: env,
    output: {
        path: path.resolve('./dist'),
        filename: outputFile,
        library: 'ReduxOrm',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    resolve: {
        modules: [
            path.resolve('./src'),
            'node_modules',
        ],
        extensions: ['.js'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [],
};
