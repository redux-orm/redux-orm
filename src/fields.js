import findKey from 'lodash/findKey';

import {
    attrDescriptor,
    forwardManyToOneDescriptor,
    backwardManyToOneDescriptor,
    forwardOneToOneDescriptor,
    backwardOneToOneDescriptor,
    manyToManyDescriptor,
} from './descriptors';

import {
    m2mName,
    reverseFieldName,
    reverseFieldErrorMessage,
} from './utils';

function getToModel(field, model, orm) {
    const { toModelName } = field;
    if (!toModelName) return;

    return toModelName === 'this'
        ? model
        : orm.get(toModelName);
}

function getThroughModel(field, fieldName, model, orm) {
    const throughModelName =
        field.through ||
        m2mName(model.modelName, fieldName);

    return orm.get(throughModelName);
}

export function installBackwardsField(field, fieldName, model, orm) {
    const toModel = getToModel(field, model, orm);
    const throughModel = field.usesThroughModel
        && getThroughModel(field, fieldName, model, orm);
    const throughFields = field.usesThroughModel
        && field.getThroughFields(fieldName, model, toModel, throughModel);

    const backwardsFieldName = field.getBackwardsFieldName(model);

    const backwardsDescriptor = Object.getOwnPropertyDescriptor(
        toModel.prototype,
        backwardsFieldName
    );
    if (backwardsDescriptor) {
        throw new Error(reverseFieldErrorMessage(
            model.modelName,
            fieldName,
            toModel.modelName,
            backwardsFieldName
        ));
    }

    // install backwards descriptor
    Object.defineProperty(
        toModel.prototype,
        backwardsFieldName,
        field.createBackwardsDescriptor(
            fieldName,
            model,
            toModel,
            throughModel,
            throughFields
        )
    );

    // install backwards virtual field
    toModel.virtualFields[backwardsFieldName] = field.createBackwardsVirtualField(
        fieldName,
        model,
        toModel,
        throughModel,
        throughFields
    );
}

export function installField(field, fieldName, model, orm) {
    const toModel = getToModel(field, model, orm);
    const throughModel = field.usesThroughModel
        && getThroughModel(field, fieldName, model, orm);
    const throughFields = field.usesThroughModel
        && field.getThroughFields(fieldName, model, toModel, throughModel);

    // install forwards descriptor
    if (field.installsForwardsDescriptor) {
        Object.defineProperty(
            model.prototype,
            fieldName,
            field.createForwardsDescriptor(
                fieldName,
                model,
                toModel,
                throughModel,
                throughFields
            )
        );
    }

    // install forwards virtual field
    if (field.installsForwardsVirtualField) {
        model.virtualFields[fieldName] = field.createForwardsVirtualField(
            fieldName,
            model,
            toModel,
            throughModel,
            throughFields
        );
    }

    if (field.installsBackwardsField) {
        installBackwardsField(field, fieldName, model, orm);
    }
}

class Field {
    getClass() {
        return this.constructor;
    }

    get installsForwardsDescriptor() {
        return true;
    }

    get installsForwardsVirtualField() {
        return false;
    }

    get installsBackwardsField() {
        return false;
    }

    get usesThroughModel() {
        return false;
    }
}

/**
 * @module fields
 */
export class Attribute extends Field {
    constructor(opts) {
        super(opts);
        this.opts = opts || {};

        if (this.opts.hasOwnProperty('getDefault')) {
            this.getDefault = this.opts.getDefault;
        }
    }

    createForwardsDescriptor(fieldName, model) {
        return attrDescriptor(fieldName);
    }
}

class RelationalField extends Field {
    constructor(...args) {
        super(...args);
        if (args.length === 1 && typeof args[0] === 'object') {
            const opts = args[0];
            this.toModelName = opts.to;
            this.relatedName = opts.relatedName;
            this.through = opts.through;
            this.throughFields = opts.throughFields;
        } else {
            [this.toModelName, this.relatedName] = args;
        }
    }

    getBackwardsFieldName(model) {
        return this.relatedName || reverseFieldName(model.modelName);
    }

    getThroughModelName(fieldName, model) {
        return this.through || m2mName(model.modelName, fieldName);
    }

    getThroughFields(fieldName, model, toModel, throughModel) {
        if (this.throughFields) {
            const [fieldAName, fieldBName] = this.throughFields;
            const fieldA = throughModel.fields[fieldAName];
            if (fieldA.toModelName === toModel.modelName) {
                return {
                    to: fieldAName,
                    from: fieldBName,
                };
            } else {
                return {
                    to: fieldBName,
                    from: fieldAName,
                };
            }
        }
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
        return {
            to: toFieldName,
            from: fromFieldName,
        };
    }

    createBackwardsVirtualField(fieldName, model, toModel, throughModel, throughFields) {
        const ThisField = this.getClass();
        return new ThisField(model.modelName, fieldName);
    }
}

export class ForeignKey extends RelationalField {
    createForwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return forwardManyToOneDescriptor(fieldName, toModel.modelName);
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return backwardManyToOneDescriptor(fieldName, model.modelName);
    }

    get installsBackwardsField() {
        return true;
    }
}

export class ManyToMany extends RelationalField {
    getDefault() {
        return [];
    }

    createForwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return manyToManyDescriptor(
            model.modelName,
            toModel.modelName,
            throughModel.modelName,
            throughFields,
            false
        );
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return manyToManyDescriptor(
            model.modelName,
            toModel.modelName,
            throughModel.modelName,
            throughFields,
            true
        );
    }

    createBackwardsVirtualField(fieldName, model, toModel, throughModel, throughFields) {
        const ThisField = this.getClass();
        return new ThisField({
            to: model.modelName,
            relatedName: fieldName,
            through: throughModel.modelName,
            throughFields,
        });
    }

    createForwardsVirtualField(fieldName, model, toModel, throughModel, throughFields) {
        const ThisField = this.getClass();
        return new ThisField({
            to: toModel.modelName,
            relatedName: fieldName,
            through: this.through,
            throughFields,
        });
    }

    get installsForwardsVirtualField() {
        return true;
    }

    get installsBackwardsField() {
        return true;
    }

    get usesThroughModel() {
        return true;
    }
}

export class OneToOne extends RelationalField {
    getBackwardsFieldName(model) {
        return this.relatedName || model.modelName.toLowerCase();
    }

    createForwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return forwardOneToOneDescriptor(fieldName, toModel.modelName)
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel, throughFields) {
        return backwardOneToOneDescriptor(fieldName, model.modelName);
    }

    get installsBackwardsField() {
        return true;
    }
}

/**
 * Defines a value attribute on the model.
 * Though not required, it is recommended to define this for each non-foreign key you wish to use.
 * Getters and setters need to be defined on each Model
 * instantiation for undeclared data fields, which is slower.
 * You can use the optional `getDefault` parameter to fill in unpassed values
 * to {@link Model#create}, such as for generating ID's with UUID:
 *
 * ```javascript
 * import getUUID from 'your-uuid-package-of-choice';
 *
 * fields = {
 *   id: attr({ getDefault: () => getUUID() }),
 *   title: attr(),
 * }
 * ```
 *
 * @param  {Object} [opts]
 * @param {Function} [opts.getDefault] - if you give a function here, it's return
 *                                       value from calling with zero arguments will
 *                                       be used as the value when creating a new Model
 *                                       instance with {@link Model#create} if the field
 *                                       value is not passed.
 * @return {Attribute}
 */
export function attr(opts) {
    return new Attribute(opts);
}

/**
 * Defines a foreign key on a model, which points
 * to a single entity on another model.
 *
 * You can pass arguments as either a single object,
 * or two arguments.
 *
 * If you pass two arguments, the first one is the name
 * of the Model the foreign key is pointing to, and
 * the second one is an optional related name, which will
 * be used to access the Model the foreign key
 * is being defined from, from the target Model.
 *
 * If the related name is not passed, it will be set as
 * `${toModelName}Set`.
 *
 * If you pass an object to `fk`, it has to be in the form
 *
 * ```javascript
 * fields = {
 *   author: fk({ to: 'Author', relatedName: 'books' })
 * }
 * ```
 *
 * Which is equal to
 *
 * ```javascript
 * fields = {
 *   author: fk('Author', 'books'),
 * }
 * ```
 *
 * @param  {string|boolean} toModelNameOrObj - the `modelName` property of
 *                                           the Model that is the target of the
 *                                           foreign key, or an object with properties
 *                                           `to` and optionally `relatedName`.
 * @param {string} [relatedName] - if you didn't pass an object as the first argument,
 *                                 this is the property name that will be used to
 *                                 access a QuerySet the foreign key is defined from,
 *                                 from the target model.
 * @return {ForeignKey}
 */
export function fk(...args) {
    return new ForeignKey(...args);
}

/**
 * Defines a many-to-many relationship between
 * this (source) and another (target) model.
 *
 * The relationship is modeled with an extra model called the through model.
 * The through model has foreign keys to both the source and target models.
 *
 * You can define your own through model if you want to associate more information
 * to the relationship. A custom through model must have at least two foreign keys,
 * one pointing to the source Model, and one pointing to the target Model.
 *
 * If you have more than one foreign key pointing to a source or target Model in the
 * through Model, you must pass the option `throughFields`, which is an array of two
 * strings, where the strings are the field names that identify the foreign keys to
 * be used for the many-to-many relationship. Redux-ORM will figure out which field name
 * points to which model by checking the through Model definition.
 *
 * Unlike `fk`, this function accepts only an object argument.
 *
 * ```javascript
 * class Authorship extends Model {}
 * Authorship.modelName = 'Authorship';
 * Authorship.fields = {
 *   author: fk('Author', 'authorships'),
 *   book: fk('Book', 'authorships'),
 * };
 *
 * class Author extends Model {}
 * Author.modelName = 'Author';
 * Author.fields = {
 *   books: many({
 *     to: 'Book',
 *     relatedName: 'authors',
 *     through: 'Authorship',
 *
 *     // this is optional, since Redux-ORM can figure
 *     // out the through fields itself as there aren't
 *     // multiple foreign keys pointing to the same models.
 *     throughFields: ['author', 'book'],
 *   })
 * };
 *
 * class Book extends Model {}
 * Book.modelName = 'Book';
 * ```
 *
 * You should only define the many-to-many relationship on one side. In the
 * above case of Authors to Books through Authorships, the relationship is
 * defined only on the Author model.
 *
 * @param  {Object} options - options
 * @param  {string} options.to - the `modelName` attribute of the target Model.
 * @param  {string} [options.through] - the `modelName` attribute of the through Model which
 *                                    must declare at least one foreign key to both source and
 *                                    target Models. If not supplied, Redux-Orm will autogenerate
 *                                    one.
 * @param  {string[]} [options.throughFields] - this must be supplied only when a custom through
 *                                            Model has more than one foreign key pointing to
 *                                            either the source or target mode. In this case
 *                                            Redux-ORM can't figure out the correct fields for
 *                                            you, you must provide them. The supplied array should
 *                                            have two elements that are the field names for the
 *                                            through fields you want to declare the many-to-many
 *                                            relationship with. The order doesn't matter;
 *                                            Redux-ORM will figure out which field points to
 *                                            the source Model and which to the target Model.
 * @param  {string} [options.relatedName] - the attribute used to access a QuerySet
 *                                          of source Models from target Model.
 * @return {ManyToMany}
 */
export function many(...args) {
    return new ManyToMany(...args);
}

/**
 * Defines a one-to-one relationship. In database terms, this is a foreign key with the
 * added restriction that only one entity can point to single target entity.
 *
 * The arguments are the same as with `fk`. If `relatedName` is not supplied,
 * the source model name in lowercase will be used. Note that with the one-to-one
 * relationship, the `relatedName` should be in singular, not plural.
 * @param  {string|boolean} toModelNameOrObj - the `modelName` property of
 *                                           the Model that is the target of the
 *                                           foreign key, or an object with properties
 *                                           `to` and optionally `relatedName`.
 * @param {string} [relatedName] - if you didn't pass an object as the first argument,
 *                                 this is the property name that will be used to
 *                                 access a Model the foreign key is defined from,
 *                                 from the target Model.
 * @return {OneToOne}
 */
export function oneToOne(...args) {
    return new OneToOne(...args);
}
