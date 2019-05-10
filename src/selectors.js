import {
    OneToOne, ForeignKey, ManyToMany,
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

export class MapSelectorSpec extends SelectorSpec {
    constructor({
        model, field, fieldName, selector, ...other
    }) {
        super(other);
        this._model = model;
        this._field = field;
        this._fieldName = fieldName;
        this._selector = selector;
    }

    get key() {
        return this._selector;
    }

    get dependencies() {
        return [this._orm, idArgSelector, state => state];
    }

    get resultFunc() {
        return (session, idArg, state) => {
            const { [this._model.modelName]: ModelClass } = session;
            if (typeof idArg === 'undefined') {
                return ModelClass.all().toModelArray()
                    .map(instance => this._getMappedValue(instance, session, state));
            }
            if (Array.isArray(idArg)) {
                return idArg.map(id => (
                    this._getMappedValue(ModelClass.withId(id), session, state)
                ));
            }
            return this._getMappedValue(ModelClass.withId(idArg), session, state);
        };
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }

    _getMappedValue(instance, session, state) {
        if (!instance) return null;
        const { [this._fieldName]: value } = instance;
        const referencedModel = session[this._field.toModelName];
        const { idAttribute: mapIdAttribute } = referencedModel;
        if (value instanceof QuerySet) {
            return value.toRefArray()
                .map(ref => this._selector(state, ref[mapIdAttribute]));
        }
        return value
            ? this._selector(state, value.ref[mapIdAttribute])
            : null;
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
                return idArg.map(id => (
                    this._getFieldValue(ModelClass.withId(id))
                ));
            }
            return this._getFieldValue(ModelClass.withId(idArg));
        };
    }

    get keySelector() {
        return (state, idArg) => (
            (typeof idArg === 'undefined') ? ALL_INSTANCES : idArg
        );
    }

    _getFieldValue(instance) {
        if (!instance) return null;
        const { [this._fieldName]: value } = instance;
        if (this._field instanceof ForeignKey) {
            if (value instanceof QuerySet) {
                return value.toRefArray();
            }
            return value ? value.ref : null;
        }
        if (this._field instanceof OneToOne) {
            return value ? value.ref : null;
        }
        if (this._field instanceof ManyToMany) {
            return value.toRefArray();
        }
        return value;
    }

    map(selector) {
        if (
            !selector ||
            typeof selector !== 'function' ||
            !selector.recomputations
        ) {
            throw new Error(`\`map()\` requires a selector as an input. Received: ${JSON.stringify(selector)} of type ${typeof selector}`);
        }
        if (!(this._field instanceof ForeignKey)) {
            throw new Error('Cannot map selectors for other fields than foreign key fields.');
        }
        return new MapSelectorSpec({
            parent: this,
            model: this._model,
            orm: this._orm,
            field: this._field,
            fieldName: this._fieldName,
            selector,
        });
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
