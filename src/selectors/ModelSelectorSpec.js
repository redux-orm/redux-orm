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
        return [this._orm, idArgSelector];
    }

    get resultFunc() {
        return ({ [this._model.modelName]: ModelClass }, idArg) => {
            if (typeof idArg === "undefined") {
                return ModelClass.all().toModelArray();
            }
            if (Array.isArray(idArg)) {
                return idArg.map((id) => {
                    return ModelClass.withId(id);
                });
            }
            return ModelClass.withId(idArg);
        };
    }

    get model() {
        return this._model;
    }
}
