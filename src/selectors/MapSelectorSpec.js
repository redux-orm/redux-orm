import ModelBasedSelectorSpec from "./ModelBasedSelectorSpec";
import idArgSelector from "./idArgSelector";

export default class MapSelectorSpec extends ModelBasedSelectorSpec {
    constructor({ field, selector, ...other }) {
        super(other);
        this._field = field;
        this._selector = selector;
    }

    /** Result for createSelectorFromSpec, not createSelectorFromSpecFor! */
    createResultFunc(parentSelector) {
        return function mapSelectorResult(state, _session, idArg) {
            /**
             * The parent selector should return a ref array
             * in case of a single ID being passed.
             * Otherwise it should return an array of ref arrays.
             */
            const parentResult = parentSelector(state, idArg);
            if (parentResult === null) {
                return null;
            }
            if (typeof idArg === "undefined" || Array.isArray(idArg)) {
                return parentResult.map((refArray) =>
                    refArray === null
                        ? null
                        : refArray.map((ref) =>
                              ref === null
                                  ? null
                                  : this.valueForRef(ref, null, state)
                          )
                );
            }
            return parentResult.map((ref) =>
                this.valueForRef(ref, null, state)
            );
        };
    }

    valueForRef(ref, _session, state) {
        const { idAttribute } = this._parent.toModel;
        return this._selector(state, ref[idAttribute]);
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
