module.exports = {
    extends: [
        "airbnb-base",
        "plugin:prettier/recommended",
        "plugin:jest/recommended",
    ],
    env: {
        jest: true,
    },
    plugins: ["jest"],
    parser: "babel-eslint",
    rules: {
        "no-unused-vars": 0,
        "id-length": 0,
        "no-underscore-dangle": 0,
        "import/no-named-as-default": 0,
        "import/no-extraneous-dependencies": 0,
        "max-len": 0,
        "comma-dangle": 0,
        "arrow-parens": 0,
        "no-plusplus": 0,
        "no-console": 0,
        "no-unsafe-negation": 0,
        "function-paren-newline": 0,
        "prefer-rest-params": 0,
        "max-classes-per-file": 0,
    },
    parserOptions: {
        ecmaFeatures: {
            ecmaVersion: 6,
        },
    },
};
