module.exports = {
    testEnvironment: 'node',
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
        'ts',
        'js',
        'json',
    ],
    testRegex: 'src/test/test(.*)\\.(js|ts)',
    transform: {
        '\\.ts?$': './node_modules/typescript-babel-jest',
        '\\.js$': './node_modules/babel-jest',
    },
};
