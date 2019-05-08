import {
    Attribute, OneToOne, ForeignKey, ManyToMany,
} from './fields';
import QuerySet from './QuerySet';

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

    get key() {
        throw new Error('Key needs to be overridden.');
    }

    get path() {
        const basePath = this._parent ? this._parent.path : [];
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

export class FieldSelectorSpec extends SelectorSpec {
    constructor({
        model, field, fieldName, ...other
    }) {
        super(other);
        this._model = model;
        this._field = field;
        this._fieldName = fieldName;
    }

    get key() {
        return this._fieldName;
    }

    get dependencies() {
        return [this._orm, idArgSelector];
    }

    get resultFunc() {
        return ({ [this._model.modelName]: ModelClass }, idArg) => {
            if (typeof idArg === 'undefined') {
                return ModelClass.all().toModelArray()
                    .map(this._getFieldValue.bind(this));
            }
            if (Array.isArray(idArg)) {
                const { idAttribute } = ModelClass;
                return ModelClass
                    .filter(instance => idArg.includes(instance[idAttribute]))
                    .toModelArray()
                    .map(this._getFieldValue.bind(this));
            }
            const instance = ModelClass.withId(idArg);
            return instance ? this._getFieldValue(instance) : null;
        };
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }

    _getFieldValue(instance) {
        const { [this._fieldName]: value } = instance;
        if (this._field instanceof Attribute) {
            return value;
        }
        if (this._field instanceof ForeignKey) {
            if (value instanceof QuerySet) {
                return value.toRefArray();
            }
            return value ? value.ref : null;
        }
        if (this._field instanceof OneToOne) {
            return value;
        }
        if (this._field instanceof ManyToMany) {
            return value.toRefArray();
        }
        throw new Error('Could not compute selector result: Unknown field type');
    }
}

function createFieldSelectorSpec({
    modelSelectorSpec, model, field, fieldName, orm,
}) {
    return new FieldSelectorSpec({
        parent: modelSelectorSpec,
        model,
        orm,
        field,
        fieldName,
    });
}

export function createModelSelectorSpec({ model, orm }) {
    const modelSelectorSpec = new ModelSelectorSpec({
        parent: null,
        orm,
        model,
    });

    Object.entries(model.fields).forEach(([fieldName, field]) => {
        const accessorName = field.as || fieldName;
        modelSelectorSpec[accessorName] = createFieldSelectorSpec({
            modelSelectorSpec,
            model,
            field,
            fieldName: accessorName,
            orm,
        });
    });

    Object.entries(model.virtualFields).forEach(([fieldName, field]) => {
        const accessorName = field.as || fieldName;
        if (modelSelectorSpec[accessorName]) return;
        modelSelectorSpec[accessorName] = createFieldSelectorSpec({
            modelSelectorSpec,
            model,
            field,
            fieldName: accessorName,
            orm,
        });
    });

    return modelSelectorSpec;
}
