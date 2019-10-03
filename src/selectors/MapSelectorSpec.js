import ModelBasedSelectorSpec from "./ModelBasedSelectorSpec";
import idArgSelector from "./idArgSelector";

export default class MapSelectorSpec extends ModelBasedSelectorSpec {
    constructor({ field, accessorName, selector, ...other }) {
        super(other);
        this._field = field;
        this._accessorName = accessorName;
        this._selector = selector;
    }

    get key() {
        return this._selector;
    }

    get dependencies() {
        return [this._orm, idArgSelector, state => state];
    }

    valueForInstance(instance, session, state) {
        if (!instance) return null;

        const {
            [this._field.toModelName]: { idAttribute },
        } = session;

        return instance[this._accessorName]
            .toRefArray()
            .map(ref => this._selector(state, ref[idAttribute]));
    }
}
