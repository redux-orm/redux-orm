const docGenConfig = {
    files: 'src/**/*.js',
    dest: 'dist',
    partial: 'tools/docgen/partial/*.hbs',
    include: {
        class: ['ORM', 'Model', 'QuerySet', 'Session'],
        function: ['createReducer', 'createSelector', 'attr', 'oneToOne', 'fk', 'many'],
    },

};

module.exports = docGenConfig;
