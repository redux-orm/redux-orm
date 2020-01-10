import ModelBasedSelectorSpec from "./ModelBasedSelectorSpec";
import idArgSelector from "./idArgSelector";

export default class MapSelectorSpec extends ModelBasedSelectorSpec {
    constructor({ field, selector, ...other }) {
        super(other);
        this._field = field;
        this._selector = selector;
    }

    get parent() {
        return this._parent;
    }

    createResultFunc(parentSelector) {
        return (state, ...other) => {
            const parentResult = parentSelector(state, ...other);
            if (parentResult === null) return null;

            const ormState = this._orm.stateSelector(state, ...other);
            const session = this._orm.session(ormState);
            const idArg = idArgSelector(state, ...other);
            const {
                [this._field.toModelName]: { idAttribute },
            } = session;
            if (typeof idArg === "undefined" || Array.isArray(idArg)) {
                return parentResult.map(ref =>
                    ref === null
                        ? null
                        : this._selector(state, ref[idAttribute])
                );
            }
            return this._selector(state, parentResult[idAttribute]);
        };
    }
}
