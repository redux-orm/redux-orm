import RelationalField from "./RelationalField";

import {
    forwardsManyToOneDescriptor,
    backwardsManyToOneDescriptor,
} from "../descriptors";

/**
 * @memberof module:fields
 */
export class ForeignKey extends RelationalField {
    createForwardsDescriptor(fieldName, model, toModel, throughModel) {
        return forwardsManyToOneDescriptor(fieldName, toModel.modelName);
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel) {
        return backwardsManyToOneDescriptor(fieldName, model.modelName);
    }

    get index() {
        return true;
    }
}

export default ForeignKey;
