module.exports = {
    src: "src",
    dest: "standalone-docs/api",
    partial: "tasks/api-docs/partial/*.hbs",
    helper: "tasks/api-docs/helper/*.js",
    rootTemplate: "tasks/api-docs/partial/template.hbs",
    configure: "jsdoc.conf.json",
    include: ["Model", "ORM", "fields/index", "QuerySet", "Session", "redux"],
    dmdOpts: {
        "no-cache": true,
        "name-format": true,
        "no-gfm": false,
        "heading-depth": 1, // number
        "member-index-format": "grouped", // none|grouped|table|dl
        "module-index-format": "dl", // none|grouped|table|dl
        "param-list-format": "table", // list|table
        "property-list-format": "table", // list|table
    },
};
