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
        this.idAttribute = (opts && opts.idAttribute) || 'id';
        this.arrName = (opts && opts.arrName) || this.name;
        this.mapName = (opts && opts.mapName) || this.name + 'ById';
    }

    accessIdArray(tree) {
        return tree[this.arrName];
    }

    accessMap(tree) {
        return tree[this.mapName];
    }

    accessId(tree, id) {
        return this.accessMap(tree)[id];
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
