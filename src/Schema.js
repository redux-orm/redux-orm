import forOwn from 'lodash/forOwn';
import find from 'lodash/find';
import findKey from 'lodash/findKey';

import Session from './Session';
import Model from './Model';
import { Database } from './db';
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
    }

    /**
     * Registers a {@link Model} class to the schema.
     *
     * If the model has declared any ManyToMany fields, their
     * through models will be generated and registered with
     * this call.
     *
     * @param  {...Model} model - a {@link Model} class to register
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
            if (fieldInstance instanceof ManyToMany && !fieldInstance.through) {
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
     * Gets a {@link Model} class by its name from the registry.
     * @param  {string} modelName - the name of the {@link Model} class to get
     * @throws If {@link Model} class is not found.
     * @return {Model} the {@link Model} class, if found
     */
    get(modelName) {
        const found = find(
            this.registry.concat(this.implicitThroughModels),
            (model) => model.modelName === modelName
        );

        if (typeof found === 'undefined') {
            throw new Error(`Did not find model ${modelName} from registry.`);
        }
        return found;
    }

    getModelClasses() {
        this._setupModelPrototypes();
        return this.registry.concat(this.implicitThroughModels);
    }

    _attachQuerySetMethods(model) {
        const { querySetClass } = model;
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
                                forwardManyToOneDescriptor(fieldName, toModel.modelName)
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
                                backwardManyToOneDescriptor(fieldName, model.modelName)
                            );
                            toModel.definedProperties[backwardsFieldName] = true;
                            toModel.virtualFields[backwardsFieldName] = new ForeignKey(model.modelName, fieldName);
                        } else if (fieldInstance instanceof ManyToMany) {
                            // Forwards.

                            const throughModelName =
                                fieldInstance.through ||
                                m2mName(model.modelName, fieldName);

                            const throughModel = this.get(throughModelName);

                            let throughFields;
                            if (!fieldInstance.throughFields) {
                                const toFieldName = findKey(
                                    throughModel.fields,
                                    field =>
                                        field instanceof ForeignKey &&
                                        field.toModelName === toModel.modelName
                                );
                                const fromFieldName = findKey(
                                    throughModel.fields,
                                    field =>
                                        field instanceof ForeignKey &&
                                        field.toModelName === model.modelName
                                );
                                throughFields = {
                                    to: toFieldName,
                                    from: fromFieldName,
                                };
                            } else {
                                const [fieldAName, fieldBName] = throughFields;
                                const fieldA = throughModel.fields[fieldAName];
                                if (fieldA.toModelName === toModel.modelName) {
                                    throughFields = {
                                        to: fieldAName,
                                        from: fieldBName,
                                    };
                                } else {
                                    throughFields = {
                                        to: fieldBName,
                                        from: fieldAName,
                                    };
                                }
                            }

                            Object.defineProperty(
                                model.prototype,
                                fieldName,
                                manyToManyDescriptor(
                                    model.modelName,
                                    toModel.modelName,
                                    throughModelName,
                                    throughFields,
                                    false
                                )
                            );
                            model.definedProperties[fieldName] = true;
                            model.virtualFields[fieldName] = new ManyToMany({
                                to: toModel.modelName,
                                relatedName: fieldName,
                                through: fieldInstance.through,
                            });

                            // Backwards.
                            const backwardsFieldName = fieldInstance.relatedName
                                ? fieldInstance.relatedName
                                : reverseFieldName(model.modelName);

                            if (toModel.definedProperties[backwardsFieldName]) {
                                // Backwards field was already defined on toModel.
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
                                manyToManyDescriptor(
                                    model.modelName,
                                    toModel.modelName,
                                    throughModelName,
                                    throughFields,
                                    true
                                )
                            );
                            toModel.definedProperties[backwardsFieldName] = true;
                            toModel.virtualFields[backwardsFieldName] = new ManyToMany({
                                to: model.modelName,
                                relatedName: fieldName,
                                through: throughModelName,
                            });
                        } else if (fieldInstance instanceof OneToOne) {
                            // Forwards.
                            Object.defineProperty(
                                model.prototype,
                                fieldName,
                                forwardOneToOneDescriptor(fieldName, toModel.modelName)
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
                                backwardOneToOneDescriptor(fieldName, model.modelName)
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
                        forwardManyToOneDescriptor(fieldName, toModel.modelName)
                    );
                    model.definedProperties[fieldName] = true;
                });
                this._attachQuerySetMethods(model);
                model.isSetUp = true;
            }
        });
    }

    getDatabase() {
        if (!this.db) {
            const models = this.getModelClasses();
            const schemaSpec = models.reduce((spec, modelClass) => {
                const tableName = modelClass.modelName;
                const tableSpec = modelClass._getTableOpts();
                spec[tableName] = Object.assign({}, tableSpec, { fields: modelClass.fields });
                return spec;
            }, {});

            this.db = new Database(schemaSpec);
        }
        return this.db;
    }

    /**
     * Returns the default state.
     * @return {Object} the default state
     */
    getDefaultState() {
        return this.getDatabase().getDefaultState();
    }

    /**
     * Begins an immutable database session.
     *
     * @param  {Object} state  - the state the database manages
     * @return {Session} a new {@link Session} instance
     */
    session(state) {
        return new Session(this, this.getDatabase(), state);
    }

    // Alias for session.
    from(state) {
        return this.session(state);
    }

    /**
     * Begins a mutable database session.
     *
     * @param  {Object} state  - the state the database manages
     * @return {Session} a new {@link Session} instance
     */
    mutableSession(state) {
        return new Session(this, this.getDatabase(), state, true);
    }
};

export default Schema;
