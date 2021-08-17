import SelectorSpec from "./SelectorSpec";
import idArgSelector from "./idArgSelector";

/**
 * @abstract
 */
export default class ModelBasedSelectorSpec extends SelectorSpec {
    constructor({ model, ...other }) {
        super(other);
        this._model = model;
    }

    get dependencies() {
        return [(state) => state, this._orm, idArgSelector];
    }

    get resultFunc() {
        return function modelBasedSelectorResult(state, session, idArg) {
            const { [this._model.modelName]: ModelClass } = session;
            if (typeof idArg === "undefined") {
                return ModelClass.all()
                    .toModelArray()
                    .map((instance) =>
                        this.valueForInstance(instance, session, state)
                    );
            }
            if (Array.isArray(idArg)) {
                return idArg.map((id) =>
                    this.valueForInstance(ModelClass.withId(id), session, state)
                );
            }
            return this.valueForInstance(
                ModelClass.withId(idArg),
                session,
                state
            );
        };
    }

    /** @abstract */
    valueForInstance(_instance, _session, _state) {
        throw new Error("Not implemented");
    }

    valueForRef(ref, session, state) {
        const { [this._model.modelName]: ModelClass } = session;
        return this.valueForInstance(
            ModelClass.withId(ref[ModelClass.idAttribute]),
            session,
            state
        );
    }

    get model() {
        return this._model;
    }

    modelIs(modelName) {
        return modelName === this._model.modelName;
    }
}
