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
}

export class ModelSelectorSpec extends SelectorSpec {
    constructor({ model, ...other }) {
        super(other);
        this._model = model;
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
                    * be re-used for any type of indexed value lookup */
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

    get key() {
        return this._model.modelName;
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
}

function createFieldSelectorSpec({ modelSelectorSpec, field, orm }) {
    return new SelectorSpec({
        parent: modelSelectorSpec,
        orm,
        field,
    });
}

export function createModelSelectorSpec({ model, orm }) {
    const modelSelectorSpec = new ModelSelectorSpec({
        parent: null,
        orm,
        model,
    });
    Object.entries(model.fields).forEach(([fieldName, field]) => {
        modelSelectorSpec[fieldName] = createFieldSelectorSpec({
            parent: modelSelectorSpec,
            field,
            fieldName,
            orm,
        });
    });
    return modelSelectorSpec;
}
