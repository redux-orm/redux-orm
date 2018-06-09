const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    output: {
        path: path.resolve('./dist'),
        filename: 'redux-orm.js',
        library: 'ReduxOrm',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    devtool: 'eval-source-map',
});
