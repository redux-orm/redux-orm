import ModelBasedSelectorSpec from "./ModelBasedSelectorSpec";
import idArgSelector from "./idArgSelector";

export default class MapSelectorSpec extends ModelBasedSelectorSpec {
    constructor({ field, selector, ...other }) {
        super(other);
        this._field = field;
        this._selector = selector;
    }

    createResultFunc(parentSelector) {
        const { idAttribute } = this._parent.toModel;
        return (state, ...other) => {
            /**
             * The parent selector should return a ref array
             * in case of a single ID being passed.
             * Otherwise it should return an array of ref arrays.
             */
            const parentResult = parentSelector(state, ...other);
            const idArg = idArgSelector(state, ...other);
            const single = (refArray) => {
                if (refArray === null) {
                    // an intermediate field could not be resolved
                    return null;
                }
                return refArray.map((ref) =>
                    this._selector(state, ref[idAttribute])
                );
            };
            if (typeof idArg === "undefined" || Array.isArray(idArg)) {
                return parentResult.map(single);
            }
            return single(parentResult);
        };
    }

    get selector() {
        return this._selector;
    }

    set selector(selector) {
        this._selector = selector;
    }

    get key() {
        return this._selector;
    }
}
