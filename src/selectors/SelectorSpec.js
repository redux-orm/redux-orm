import { ID_ARG_KEY_SELECTOR } from "../constants";

export default class SelectorSpec {
    constructor({ parent, orm }) {
        this._parent = parent;
        this._orm = orm;
        this.keySelector = ID_ARG_KEY_SELECTOR;
    }

    get cachePath() {
        const basePath = this._parent ? this._parent.cachePath : [];
        return [...basePath, this.key];
    }

    get orm() {
        return this._orm;
    }

    get parent() {
        return this._parent;
    }
}
