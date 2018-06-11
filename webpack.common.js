const path = require('path');

module.exports = {
    entry: './src/index.js',
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
};
