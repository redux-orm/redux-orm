import SelectorSpec from "./SelectorSpec";

export default class ModelBasedSelectorSpec extends SelectorSpec {
    constructor({ model, ...other }) {
        super(other);
        this._model = model;
    }

    get resultFunc() {
        return (session, idArg, ...other) => {
            const { [this._model.modelName]: ModelClass } = session;
            if (typeof idArg === "undefined") {
                return ModelClass.all()
                    .toModelArray()
                    .map((instance) =>
                        this.valueForInstance(instance, session, ...other)
                    );
            }
            if (Array.isArray(idArg)) {
                return idArg.map((id) =>
                    this.valueForInstance(
                        ModelClass.withId(id),
                        session,
                        ...other
                    )
                );
            }
            return this.valueForInstance(
                ModelClass.withId(idArg),
                session,
                ...other
            );
        };
    }

    get model() {
        return this._model;
    }
}
