module.exports = {
    extends: ["airbnb-base", "plugin:prettier/recommended"],
    parser: "babel-eslint",
    rules: {
        "max-len": 0,
        "id-length": 0,
        "consistent-return": 1,
        "class-methods-use-this": 0,
        "no-unused-vars": ["error", { args: "none" }],
        "no-underscore-dangle": ["warn", { allowAfterThis: true }],
        "no-param-reassign": ["error", { props: false }],
        "no-prototype-builtins": 0,
        "no-plusplus": 0,
        "no-console": 0,
        "prefer-rest-params": 0,
        "import/no-named-as-default": 0,
        "function-paren-newline": 0,
        "operator-linebreak": 0,
        "max-classes-per-file": ["warn", 1],
    },
    parserOptions: {
        ecmaFeatures: {
            ecmaVersion: 6,
        },
    },
};
