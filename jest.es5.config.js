const path = require("path");

module.exports = {
    rootDir: path.resolve("./src/"),
    testRegex: "test/functional/es5\\.(js)",
    moduleFileExtensions: ["js", "json"],
    transform: {},
    collectCoverage: false,
};
