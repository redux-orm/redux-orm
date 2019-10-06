const path = require("path");

module.exports = {
    rootDir: path.resolve("./src/"),
    testRegex: "test/(.*)/(.*)\\.(js)",
    moduleFileExtensions: ["js", "json"],
    testPathIgnorePatterns: [
        "test/functional/es5\\.(js)",
        "test/functional/performance\\.(js)",
    ],
    transform: {
        "\\.js$": "babel-jest",
    },
    coverageDirectory: "../coverage/",
    collectCoverage: true,
    collectCoverageFrom: ["*.js", "*/*.js"],
    coveragePathIgnorePatterns: ["test/*"],
    coverageThreshold: {
        global: {
            branches: 98,
            functions: 100,
            lines: 100,
            statements: 99,
        },
    },
};
