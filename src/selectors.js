import {
    ForeignKey, ManyToMany, RelationalField,
} from './fields';
import QuerySet from './QuerySet';
import Model from './Model';

/**
 * @module selectors
 */

const ALL_INSTANCES = Symbol('REDUX_ORM_ALL_INSTANCES');

function idArgSelector(state, idArg) {
    return idArg;
}

export class SelectorSpec {
    constructor({ parent, orm }) {
        this._parent = parent;
        this._orm = orm;
    }

    get cachePath() {
        const basePath = this._parent ? this._parent.cachePath : [];
        return [...basePath, this.key];
    }
}

export class ModelSelectorSpec extends SelectorSpec {
    constructor({ model, ...other }) {
        super(other);
        this._model = model;
    }

    get key() {
        return this._model.modelName;
    }

    get dependencies() {
        return [this._orm, idArgSelector];
    }

    get resultFunc() {
        return ({ [this._model.modelName]: ModelClass }, idArg) => {
            if (typeof idArg === 'undefined') {
                return ModelClass.all().toRefArray();
            }
            if (Array.isArray(idArg)) {
                const { idAttribute } = ModelClass;
                /**
                 * TODO: we might want to allow passing arrays of property values
                 * for faster matching of indexed columns; this might be the
                 * key to allowing fast joins anyways, and could potentially
                 * be re-used for any type of indexed value lookup
                 */
                return ModelClass
                    .filter(instance => idArg.includes(instance[idAttribute]))
                    .toRefArray();
            }
            const instance = ModelClass.withId(idArg);
            return instance ? instance.ref : null;
        };
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }
}

class ModelBasedSelectorSpec extends SelectorSpec {
    constructor({
        model, ...other
    }) {
        super(other);
        this._model = model;
    }

    get resultFunc() {
        return (session, idArg, ...other) => {
            const { [this._model.modelName]: ModelClass } = session;
            if (typeof idArg === 'undefined') {
                return ModelClass.all().toModelArray()
                    .map(instance => this.valueForInstance(instance, session, ...other));
            }
            if (Array.isArray(idArg)) {
                return idArg.map(id => (
                    this.valueForInstance(ModelClass.withId(id), session, ...other)
                ));
            }
            return this.valueForInstance(ModelClass.withId(idArg), session, ...other);
        };
    }
}

export class MapSelectorSpec extends ModelBasedSelectorSpec {
    constructor({
        field, accessorName, selector, ...other
    }) {
        super(other);
        this._field = field;
        this._accessorName = accessorName;
        this._selector = selector;
    }

    get key() {
        return this._selector;
    }

    get dependencies() {
        return [this._orm, idArgSelector, state => state];
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }

    valueForInstance(instance, session, state) {
        if (!instance) return null;
        const {
            [this._accessorName]: value,
        } = instance;
        if (!value) return null;
        const {
            [this._field.toModelName]: {
                idAttribute: mapIdAttribute,
            },
        } = session;
        return value.toRefArray()
            .map(ref => this._selector(state, ref[mapIdAttribute]));
    }
}

export class FieldSelectorSpec extends ModelBasedSelectorSpec {
    constructor({
        field, fieldModel, accessorName, isVirtual, ...other
    }) {
        super(other);
        this._field = field;
        this._fieldModel = fieldModel;
        this._accessorName = accessorName;
        this._isVirtual = isVirtual;
    }

    get key() {
        return this._accessorName;
    }

    get dependencies() {
        return [this._orm, idArgSelector];
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }

    valueForInstance(instance, session) {
        if (!instance) return null;
        let value;
        if (this._parent instanceof ModelSelectorSpec) {
            value = instance[this._accessorName];
        } else if (this._parent instanceof FieldSelectorSpec) {
            const {
                [this._parent.toModelName]: ParentToModel,
            } = session;
            const parentRef = this._parent.valueForInstance(instance, session);
            const parentInstance = parentRef ? new ParentToModel(parentRef) : null;
            value = parentInstance ? parentInstance[this._accessorName] : null;
        }
        if (value instanceof Model) {
            return value ? value.ref : null;
        }
        if (value instanceof QuerySet) {
            return value.toRefArray();
        }
        return value;
    }

    map(selector) {
        if (selector instanceof ModelSelectorSpec) {
            if (this.toModelName === selector._model.modelName) {
                throw new Error(`Cannot select models in a \`map()\` call. If you just want the \`${this._accessorName}\` as a ref array then you can simply drop the \`map()\`. Otherwise make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`);
            } else {
                throw new Error(`Cannot select \`${selector._model.modelName}\` models in this \`map()\` call. Make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`);
            }
        } else if (selector instanceof FieldSelectorSpec) {
            if (this.toModelName !== selector._model.modelName) {
                throw new Error(`Cannot select fields of the \`${selector._model.modelName}\` model in this \`map()\` call. Make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`);
            }
        } else if (
            !selector ||
            typeof selector === 'function' &&
            !selector.recomputations
        ) {
            throw new Error(`\`map()\` requires a selector as an input. Received: ${JSON.stringify(selector)} of type ${typeof selector}`);
        }
        if (
            !(this._field instanceof ForeignKey) &&
            !(this._field instanceof ManyToMany)
        ) {
            throw new Error('Cannot map selectors for non-collection fields');
        }
        return new MapSelectorSpec({
            parent: this,
            model: this._model,
            orm: this._orm,
            field: this._field,
            accessorName: this._accessorName,
            selector,
        });
    }

    get toModelName() {
        return (this._field.toModelName === 'this')
            ? this._fieldModel.modelName
            : this._field.toModelName;
    }
}

function createFieldSelectorSpec({
    parent, model, field, accessorName, orm, isVirtual,
}) {
    const fieldSelectorSpec = new FieldSelectorSpec({
        parent,
        model,
        orm,
        field,
        accessorName,
        isVirtual,
    });
    /* Do not even try to create field selectors below attributes. */
    if (!(field instanceof RelationalField)) {
        // "orm.Author.name.publisher" would be nonsense
        return fieldSelectorSpec;
    }
    /* Prevent field selectors below collections. */
    if (parent instanceof FieldSelectorSpec) { /* eslint-disable no-underscore-dangle */
        if (
            // "orm.Author.books.publisher" would be nonsense
            (parent._field instanceof ForeignKey && parent._isVirtual) ||
            // "orm.Genre.books.publisher" would be nonsense
            (parent._field instanceof ManyToMany)
        ) {
            throw new Error(`Cannot create a selector for \`${parent._accessorName}.${accessorName}\` because \`${parent._accessorName}\` is a collection field.`);
        }
    }
    const { toModelName } = field;
    if (!toModelName) return fieldSelectorSpec;
    const toModel = orm.get(
        toModelName === 'this' ? model.modelName : toModelName
    );
    Object.entries(toModel.fields).forEach(([relatedFieldName, relatedField]) => {
        const fieldAccessorName = relatedField.as || relatedFieldName;
        Object.defineProperty(fieldSelectorSpec, fieldAccessorName, {
            get: () => createFieldSelectorSpec({
                parent: fieldSelectorSpec,
                model,
                fieldModel: toModel,
                field: relatedField,
                accessorName: fieldAccessorName,
                orm,
                isVirtual: false,
            }),
        });
    });
    Object.entries(toModel.virtualFields).forEach(([relatedFieldName, relatedField]) => {
        const fieldAccessorName = relatedField.as || relatedFieldName;
        if (fieldSelectorSpec.hasOwnProperty(fieldAccessorName)) {
            return;
        }
        Object.defineProperty(fieldSelectorSpec, fieldAccessorName, {
            get: () => createFieldSelectorSpec({
                parent: fieldSelectorSpec,
                model,
                fieldModel: toModel,
                field: relatedField,
                accessorName: fieldAccessorName,
                orm,
                isVirtual: true,
            }),
        });
    });
    return fieldSelectorSpec;
}

export function createModelSelectorSpec({ model, orm }) {
    const modelSelectorSpec = new ModelSelectorSpec({
        parent: null,
        orm,
        model,
    });

    Object.entries(model.fields).forEach(([fieldName, field]) => {
        const fieldAccessorName = field.as || fieldName;
        Object.defineProperty(modelSelectorSpec, fieldAccessorName, {
            get: () => createFieldSelectorSpec({
                parent: modelSelectorSpec,
                model,
                fieldModel: model,
                field,
                accessorName: fieldAccessorName,
                orm,
                isVirtual: false,
            }),
        });
    });

    Object.entries(model.virtualFields).forEach(([fieldName, field]) => {
        const fieldAccessorName = field.as || fieldName;
        if (modelSelectorSpec.hasOwnProperty(fieldAccessorName)) {
            return;
        }
        Object.defineProperty(modelSelectorSpec, fieldAccessorName, {
            get: () => createFieldSelectorSpec({
                parent: modelSelectorSpec,
                model,
                fieldModel: model,
                field,
                accessorName: fieldAccessorName,
                orm,
                isVirtual: true,
            }),
        });
    });

    return modelSelectorSpec;
}
