const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve('./dist'),
        filename: 'redux-orm.min.js',
        library: 'ReduxOrm',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    devtool: 'source-map',
});
