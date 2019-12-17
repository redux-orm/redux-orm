module.exports = {
    tabWidth: 4,
    semi: true,
    singleQuote: false,
    overrides: [
        {
            files: ["*.js", "*.mjs"],
            options: {
                trailingComma: "es5",
            },
        },
        {
            files: "*.json",
            options: {
                tabWidth: 2,
            },
        },
    ],
};
