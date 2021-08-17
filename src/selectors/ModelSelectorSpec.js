import SelectorSpec from "./SelectorSpec";
import idArgSelector from "./idArgSelector";

export default class ModelSelectorSpec extends SelectorSpec {
    constructor({ model, ...other }) {
        super(other);
        this._model = model;
    }

    get key() {
        return this._model.modelName;
    }

    get dependencies() {
        return [(state) => state, this._orm, idArgSelector];
    }

    get resultFunc() {
        return function modelSelectorResult(_state, session, idArg) {
            const { [this._model.modelName]: ModelClass } = session;
            if (typeof idArg === "undefined") {
                return ModelClass.all().toRefArray();
            }
            if (Array.isArray(idArg)) {
                return idArg.map((id) => {
                    const instance = ModelClass.withId(id);
                    return instance ? instance.ref : null;
                });
            }
            const instance = ModelClass.withId(idArg);
            return instance ? instance.ref : null;
        };
    }

    valueForRef(ref, _session) {
        return ref;
    }

    get model() {
        return this._model;
    }

    modelIs(modelName) {
        return modelName === this._model.modelName;
    }
}
