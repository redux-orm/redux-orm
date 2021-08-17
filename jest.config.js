const path = require("path");

module.exports = {
    preset: "ts-jest",
    rootDir: path.resolve("./src/"),
    testRegex: "test/(.*)/(.*)\\.(js|ts)",
    moduleFileExtensions: ["js", "ts", "json"],
    testPathIgnorePatterns: [
        "test/functional/es5\\.(js)",
        "test/functional/performance\\.(js)",
    ],
    transform: {
        "\\.js$": "babel-jest",
        "\\.ts$": "ts-jest",
    },
    coverageDirectory: "../coverage/",
    collectCoverage: true,
    collectCoverageFrom: ["*.js", "*/*.js", "*[^\\.d].ts", "*/*[^\\.d].ts"],
    coveragePathIgnorePatterns: ["test/*"],
    coverageThreshold: {
        global: {
            branches: 98,
            functions: 100,
            lines: 100,
            statements: 99,
        },
    },
    globals: {
        "ts-jest": {
            diagnostics: false,
            warnOnly: true,
        },
    },
};
