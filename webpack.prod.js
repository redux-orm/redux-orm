/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");

const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
    mode: "production",
    output: {
        path: path.resolve("./dist"),
        filename: "redux-orm.min.js",
        library: "ReduxOrm",
        libraryTarget: "umd",
        umdNamedDefine: true,
    },
    devtool: "source-map",
});
