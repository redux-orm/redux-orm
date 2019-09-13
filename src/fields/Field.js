import DefaultFieldInstaller from './DefaultFieldInstaller';

export default class Field {
    constructor() {
        this.index = false;
    }

    get installerClass() {
        return DefaultFieldInstaller;
    }

    getClass() {
        return this.constructor;
    }

    references(model) {
        return false;
    }

    getThroughModelName(fieldName, model) {
        return null;
    }

    get installsForwardsDescriptor() {
        return true;
    }

    get installsForwardsVirtualField() {
        return false;
    }

    get installsBackwardsDescriptor() {
        return false;
    }

    get installsBackwardsVirtualField() {
        return false;
    }
}
