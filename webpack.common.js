/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

module.exports = {
    entry: "./src/index.js",
    resolve: {
        modules: [path.resolve("./src"), "node_modules"],
        extensions: [".js", ".ts"],
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    plugins: ["lodash"],
                },
            },
        ],
    },
    plugins: [new LodashModuleReplacementPlugin()],
};
