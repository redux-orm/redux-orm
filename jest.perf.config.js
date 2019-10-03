const path = require("path");

module.exports = {
    rootDir: path.resolve("./src/"),
    testRegex: "test/functional/performance\\.(js)",
    moduleFileExtensions: ["js", "json"],
    transform: {
        "\\.js$": "babel-jest",
    },
    collectCoverage: false,
    verbose: true,
};
