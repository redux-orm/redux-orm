import DefaultFieldInstaller from "./DefaultFieldInstaller";

/**
 * @private
 * @memberof module:fields
 */
export class Field {
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

    get installsForwardsVirtualField() {
        return false;
    }

    get installsBackwardsDescriptor() {
        return false;
    }

    get installsBackwardsVirtualField() {
        return false;
    }

    get index() {
        return false;
    }
}

export default Field;
