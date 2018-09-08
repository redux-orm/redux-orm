module.exports = {
    coverageDirectory: './coverage/',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/*.js',
    ],
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 80,
            lines: 85,
            statements: 85,
        },
    },
    moduleFileExtensions: [
        'js',
        'json',
    ],
    testPathIgnorePatterns: [
        'src/test/functional/es5\\.(js)',
    ],
    testRegex: 'src/test/(.*)/(.*)\\.(js)',
    transform: {
        '\\.js$': 'babel-jest',
    },
};
