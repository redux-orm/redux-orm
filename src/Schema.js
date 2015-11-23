import defaults from 'lodash/object/defaults';

/**
 * Defines the settings for a entity branch.
 * This is very simple at the moment - I'm
 * thinking about a working approach to related
 * managers, which could be declared similarly to
 * [normalizr](https://github.com/gaearon/normalizr).
 */
const Schema = class Schema {
    /**
     * Create a new Schema.
     * @param  {string} name - plural name of the entities branch
     * @param  {Object} [opts] - settings for the schema.
     * @param  {string} [opts.idAttribute=id] - the attribute name for entity id's.
     * @param  {string} [opts.arrName=name] - the tree property name that holds an array of id's.
     * @param  {string} [opts.mapName=name + ById] - the tree property name that holds the id-entity map.
     */
    constructor(name, opts) {
        this.name = name;
        this.buildOpts(opts);
    }

    buildOpts(opts) {
        const options = opts || {};
        defaults(options, Schema.defaultOpts);

        if (!options.hasOwnProperty('arrName')) {
            options.arrName = this.name;
        }

        if (!options.hasOwnProperty('mapName')) {
            options.mapName = this.name + 'ById';
        }
        Object.assign(this, options);
    }

    getDefaultState() {
        return {
            [this.arrName]: [],
            [this.mapName]: {},
        };
    }
};


Schema.defaultOpts = {
    idAttribute: 'id',
};

export default Schema;
