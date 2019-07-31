const docGenConfig = {
  src: 'src',
  include: [
    'Model',
    'ORM',
    'Session',
    'QuerySet',
    'fields',
    'redux',
    'utils',
    'descriptors',
    'db/Table',
  ],
  dest: 'standalone-docs/api',
  partial: 'tasks/docgen/partial/*.hbs',
  helper: 'tasks/docgen/helper/*.js',
  rootTemplate: 'tasks/docgen/partial/template.hbs',
  configure: 'jsdoc.conf.json',
  dmdOpts: {
    'no-cache': true,
    'name-format': true,
    'no-gfm': false,
    'heading-depth': 1, // number
    'member-index-format': 'grouped', // none|grouped|table|dl
    'module-index-format': 'dl', // none|grouped|table|dl
    'param-list-format': 'table', // list|table
    'property-list-format': 'table', // list|table
  },
}

module.exports = docGenConfig
