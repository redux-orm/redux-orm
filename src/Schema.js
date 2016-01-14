import {createSelectorCreator} from 'reselect';
import forOwn from 'lodash/object/forOwn';
import find from 'lodash/collection/find';

import Session from './Session';
import Model from './Model';
import {
    ForeignKey,
    ManyToMany,
    OneToOne,
} from './fields';
import {
    forwardManyToOneDescriptor,
    backwardManyToOneDescriptor,
    forwardOneToOneDescriptor,
    backwardOneToOneDescriptor,
    manyToManyDescriptor,
} from './descriptors';
import {memoize, eqCheck} from './memoize';

import {
    m2mName,
    attachQuerySetMethods,
    m2mToFieldName,
    m2mFromFieldName,
    reverseFieldName,
    reverseFieldErrorMessage,
} from './utils';

/**
 * Schema's responsibility is tracking the set of {@link Model} classes used in the database.
 * To include your model in that set, Schema offers {@link Schema#register} and a
 * shortcut {@link Schema#define} methods.
 *
 * Schema also handles starting a Session with {@link Schema#from}.
 */
const Schema = class Schema {
    /**
     * Creates a new Schema.
     */
    constructor() {
        this.registry = [];
        this.implicitThroughModels = [];
        this.selectorCreator = createSelectorCreator(memoize, eqCheck, this);
    }

    /**
     * Defines a Model class with the provided options and registers
     * it to the schema instance.
     *
     * Note that you can also define Model classes by yourself
     * with ES6 classes.
     *
     * @param  {string} modelName - the name of the model class
     * @param  {Object} [relatedFields] - a dictionary of `fieldName: fieldInstance`
     * @param  {Function} [reducer] - the reducer function to use for this model
     * @param  {Object} [backendOpts] -Backend options for this model.
     * @return {Model} The defined model class.
     */
    define(modelName, relatedFields, reducer, backendOpts) {
        class ShortcutDefinedModel extends Model {}
        ShortcutDefinedModel.modelName = modelName;
        ShortcutDefinedModel.backend = backendOpts;
        ShortcutDefinedModel.fields = relatedFields;

        if (typeof reducer === 'function') {
            ShortcutDefinedModel.reducer = reducer;
        }

        this.register(ShortcutDefinedModel);

        return ShortcutDefinedModel;
    }

    /**
     * Registers a model class to the schema.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call.
     *
     * @param  {...Model} model - a model to register
     * @return {undefined}
     */
    register() {
        const models = Array.prototype.slice.call(arguments);
        models.forEach(model => {
            model.invalidateClassCache();

            this.registerManyToManyModelsFor(model);
            this.registry.push(model);
        });
    }

    registerManyToManyModelsFor(model) {
        const fields = model.fields;
        const thisModelName = model.modelName;

        forOwn(fields, (fieldInstance, fieldName) => {
            if (fieldInstance instanceof ManyToMany) {
                let toModelName;
                if (fieldInstance.toModelName === 'this') {
                    toModelName = thisModelName;
                } else {
                    toModelName = fieldInstance.toModelName;
                }

                const fromFieldName = m2mFromFieldName(thisModelName);
                const toFieldName = m2mToFieldName(toModelName);

                const Through = class ThroughModel extends Model {};

                Through.modelName = m2mName(thisModelName, fieldName);

                Through.fields = {
                    [fromFieldName]: new ForeignKey(thisModelName),
                    [toFieldName]: new ForeignKey(toModelName),
                };

                Through.invalidateClassCache();
                this.implicitThroughModels.push(Through);
            }
        });
    }

    /**
     * Gets a model by its name from the registry.
     * @param  {string} modelName - the name of the model to get
     * @throws If model is not found.
     * @return {Model} the model class, if found
     */
    get(modelName) {
        const found = find(this.registry.concat(this.implicitThroughModels), (model) => model.modelName === modelName);
        if (typeof found === 'undefined') {
            throw new Error(`Did not find model ${modelName} from registry.`);
        }
        return found;
    }

    _getModelClasses() {
        this._setupModelPrototypes();
        return this.registry.concat(this.implicitThroughModels);
    }

    _attachQuerySetMethods(model) {
        const {querySetClass} = model;
        attachQuerySetMethods(model, querySetClass);
    }

    _setupModelPrototypes() {
        this.registry.forEach(model => {
            if (!model.isSetUp) {
                const fields = model.fields;
                forOwn(fields, (fieldInstance, fieldName) => {
                    const descriptor = Object.getOwnPropertyDescriptor(model.prototype, fieldName);
                    if (typeof descriptor === 'undefined') {
                        const toModelName = fieldInstance.toModelName;
                        const toModel = toModelName === 'this' ? model : this.get(toModelName);

                        if (fieldInstance instanceof ForeignKey) {
                            // Forwards.
                            Object.defineProperty(
                                model.prototype,
                                fieldName,
                                forwardManyToOneDescriptor(fieldName, toModel)
                            );
                            model.definedProperties[fieldName] = true;

                            // Backwards.
                            const backwardsFieldName = fieldInstance.relatedName
                                ? fieldInstance.relatedName
                                : reverseFieldName(model.modelName);

                            if (toModel.definedProperties[backwardsFieldName]) {
                                const errorMsg = reverseFieldErrorMessage(
                                    model.modelName,
                                    fieldName,
                                    toModel.modelName,
                                    backwardsFieldName
                                );
                                throw new Error(errorMsg);
                            }

                            Object.defineProperty(
                                toModel.prototype,
                                backwardsFieldName,
                                backwardManyToOneDescriptor(fieldName, model)
                            );
                            toModel.definedProperties[backwardsFieldName] = true;
                            toModel.virtualFields[backwardsFieldName] = new ForeignKey(model.modelName, fieldName);
                        } else if (fieldInstance instanceof ManyToMany) {
                            // Forwards.
                            const throughModelName = m2mName(model.modelName, fieldName);
                            const throughModel = this.get(throughModelName);

                            Object.defineProperty(
                                model.prototype,
                                fieldName,
                                manyToManyDescriptor(model, toModel, throughModel, false)
                            );
                            model.definedProperties[fieldName] = true;
                            model.virtualFields[fieldName] = new ManyToMany(toModel.modelName, fieldName);

                            // Backwards.
                            const backwardsFieldName = fieldInstance.relatedName
                                ? fieldInstance.relatedName
                                : reverseFieldName(model.modelName);

                            if (toModel.definedProperties[backwardsFieldName]) {
                                const errorMsg = reverseFieldErrorMessage(
                                    model.modelName,
                                    fieldName,
                                    toModel.modelName,
                                    backwardsFieldName
                                );
                                throw new Error(errorMsg);
                            }

                            Object.defineProperty(
                                toModel.prototype,
                                backwardsFieldName,
                                manyToManyDescriptor(model, toModel, throughModel, true)
                            );
                            toModel.definedProperties[backwardsFieldName] = true;
                            toModel.virtualFields[backwardsFieldName] = new ManyToMany(model.modelName, fieldName);
                        } else if (fieldInstance instanceof OneToOne) {
                            // Forwards.
                            Object.defineProperty(
                                model.prototype,
                                fieldName,
                                forwardOneToOneDescriptor(fieldName, toModel)
                            );
                            model.definedProperties[fieldName] = true;

                            // Backwards.
                            const backwardsFieldName = fieldInstance.relatedName
                                ? fieldInstance.relatedName
                                : model.modelName.toLowerCase();

                            if (toModel.definedProperties[backwardsFieldName]) {
                                const errorMsg = reverseFieldErrorMessage(
                                    model.modelName,
                                    fieldName,
                                    toModel.modelName,
                                    backwardsFieldName
                                );
                                throw new Error(errorMsg);
                            }

                            Object.defineProperty(
                                toModel.prototype,
                                backwardsFieldName,
                                backwardOneToOneDescriptor(fieldName, model)
                            );
                            toModel.definedProperties[backwardsFieldName] = true;
                            toModel.virtualFields[backwardsFieldName] = new OneToOne(model.modelName, fieldName);
                        }
                    }
                });
                this._attachQuerySetMethods(model);
                model.isSetUp = true;
            }
        });

        this.implicitThroughModels.forEach(model => {
            if (!model.isSetUp) {
                forOwn(model.fields, (fieldInstance, fieldName) => {
                    const toModelName = fieldInstance.toModelName;
                    const toModel = toModelName === 'this' ? model : this.get(toModelName);
                    // Only Forwards.
                    Object.defineProperty(
                        model.prototype,
                        fieldName,
                        forwardManyToOneDescriptor(fieldName, toModel)
                    );
                    model.definedProperties[fieldName] = true;
                });
                this._attachQuerySetMethods(model);
                model.isSetUp = true;
            }
        });
    }

    /**
     * Returns the default state
     * @return {Object} the default state
     */
    getDefaultState() {
        const models = this._getModelClasses();
        const state = {};
        models.forEach(modelClass => {
            state[modelClass.modelName] = modelClass.getDefaultState();
        });
        return state;
    }

    /**
     * Begins a database {@link Session}.
     *
     * @param  {Object} state  - the state the database manages
     * @param  {Object} [action] - the dispatched action object
     * @return {Session} a new session instance
     */
    from(state, action) {
        return new Session(this._getModelClasses(), state, action);
    }

    withMutations(state) {
        return new Session(this._getModelClasses(), state, undefined, true);
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

    /**
     * Returns a memoized selector based on passed arguments.
     * This is similar to `reselect`'s `createSelector`,
     * except you can also pass a single function to be memoized.
     *
     * If you pass multiple functions, the format will be the
     * same as in `reselect`. The last argument is the selector
     * function and the previous are input selectors.
     *
     * When you use this method to create a selector, the returned selector
     * expects the whole `redux-orm` state branch as input. In the selector
     * function that you pass as the last argument, you will receive
     * `session` argument (a `Session` instance) followed by any
     * input arguments, like in `reselect`.
     *
     * This is an example selector:
     *
     * ```javascript
     * const bookSelector = schema.createSelector(session => {
     *     return session.Book.map(book => {
     *         return Object.assign(book.toPlain(), {
     *             authors: book.authors.map(author => author.name),
     *             genres: book.genres.map(genre => genre.name),
     *         });
     *     });
     * });
     * ```
     *
     * redux-orm uses a special memoization function to avoid recomputations.
     * When a selector runs for the first time, it checks which Models' state
     * branches were accessed. On subsequent runs, the selector first checks
     * if those branches have changed -- if not, it just returns the previous
     * result. This way you can use the `PureRenderMixin` in your React
     * components for performance gains.
     *
     * @param  {...Function} args - zero or more input selectors
     *                              and the selector function.
     * @return {Function} memoized selector
     */
    createSelector(...args) {
        if (args.length === 1) {
            return memoize(args[0], eqCheck, this);
        }
        return this.selectorCreator(...args);
    }
};

export default Schema;
