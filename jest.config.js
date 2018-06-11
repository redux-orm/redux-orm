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
    testRegex: 'src/test/test(.*)\\.(js)',
    transform: {
        '\\.js$': 'babel-jest',
    },
};
