import forOwn from 'lodash/object/forOwn';
import find from 'lodash/collection/find';
import Session from './Session';
import Model from './Model';

/**
 * The Schema class' responsibility is the database
 * structure. The database structure is represented by
 * a set of models. To include your model in that set,
 * Schema offers {@link Schema#register} and a shortcut {@link Schema#define} methods.
 *
 * Schema also handles starting a Session with {@link Schema#from}.
 */
const Schema = class Schema {
    /**
     * Creates a new Schema.
     */
    constructor() {
        this.registry = [];
    }

    /**
     * Defines a Model class with the provided options and registers
     * it to the schema instance.
     *
     * Note that you can also define Model classes by yourself
     * in ES6 syntax.
     *
     * @param  {string} modelName - the name of the model class
     * @param  {Object} [relatedFields] - a dictionary of `fieldName: fieldInstance`
     * @param  {Function} [reducer] - the reducer function to use for this model
     * @param  {Object} [metaOpts] -Meta options for this model.
     * @return {Model} The defined model class.
     */
    define(modelName, relatedFields, reducer, metaOpts) {
        class ShortcutDefinedModel extends Model {
            static getMetaOptions() {
                return {name: modelName, ...metaOpts};
            }
        }

        ShortcutDefinedModel.fields = relatedFields;

        if (typeof reducer === 'function') {
            ShortcutDefinedModel.reducer = reducer;
        }

        this.register(ShortcutDefinedModel);

        return ShortcutDefinedModel;
    }

    /**
     * Sets a reducer function to the model with `modelName`.
     * @param {string} modelName - The name of the model you want to set a reducer to
     * @param {Function} reducer - The reducer function.
     */
    setReducer(modelName, reducer) {
        const model = this.get(modelName);
        model.reducer = reducer;
    }

    /**
     * Registers a model class to the schema.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call.
     *
     * @param  {Model} model - the model to register
     * @return {undefined}
     */
    register(model) {
        const m2m = model.getManyToManyModels();
        this.registry.push(model, ...m2m);
    }

    /**
     * Gets a model by its name from the registry.
     * @param  {string} modelName - the name of the model to get
     * @throws If model is not found.
     * @return {Model} the model class, if found
     */
    get(modelName) {
        const found = find(this.registry, (model) => model.getName() === modelName);
        if (typeof found === 'undefined') {
            throw new Error(`Did not find model ${modelName} from registry.`);
        }
        return found;
    }

    getModelClassesFor(orm) {
        this.registry.forEach(model => {
            model.connect(orm);
        });
        return this.registry;
    }

    // fromFixture(data){
    //     const state = {};
    //     const modelsInited = [];
    //     forOwn(data, (value, key) => {
    //         const model = this.get(key);
    //         state[key] = this.get(key);
    //         modelsInited.push(key);
    //     });
    //     const orm = new Session(this);
    //     return o
    // }

    fromEmpty(action) {
        return new Session(this, this.getDefaultState(), action);
    }

    /**
     * Begins a database {@link Session}.
     *
     * @param  {Object} state  - the state the database manages
     * @param  {Object} action - the dispatched action object
     * @return {Session} a new session instance
     */
    from(state, action) {
        return new Session(this, state, action);
    }

    /**
     * Returns a reducer function you can plug into your own
     * reducer. One way to do that is to declare your root reducer:
     *
     * ```javascript
     * function rootReducer(state, action) {
     *     return {
     *         entities: schema.reducer(),
     *         // Any other reducers you use.
     *     }
     * }
     * ```
     *
     * @return {Function} a reducer function that creates a new {@link Session} on
     *                    each action dispatch.
     */
    reducer() {
        return (state, action) => {
            return this.from(state, action).reduce();
        };
    }

    bootstrap(func) {
        const orm = new Session(this);
        return orm.bootstrap(func);
    }
};

export default Schema;
