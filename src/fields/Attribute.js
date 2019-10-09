import Field from "./Field";

import { attrDescriptor } from "../descriptors";

/**
 * @memberof module:fields
 */
export class Attribute extends Field {
    constructor(opts) {
        super();
        this.opts = opts || {};

        if (this.opts.hasOwnProperty("getDefault")) {
            this.getDefault = this.opts.getDefault;
        }
    }

    createForwardsDescriptor(fieldName, model) {
        return attrDescriptor(fieldName);
    }
}

export default Attribute;
