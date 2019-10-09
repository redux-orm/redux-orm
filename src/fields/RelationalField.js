/* eslint-disable max-classes-per-file */
import Field from "./Field";
import DefaultFieldInstaller from "./DefaultFieldInstaller";

import { reverseFieldName, normalizeModelReference } from "../utils";

/**
 * @private
 * @memberof module:fields
 */
export class RelationalField extends Field {
    constructor(...args) {
        super();
        if (args.length === 1 && typeof args[0] === "object") {
            const opts = args[0];
            this.toModelName = normalizeModelReference(opts.to);
            this.relatedName = opts.relatedName;
            this.through = normalizeModelReference(opts.through);
            this.throughFields = opts.throughFields;
            this.as = opts.as;
        } else {
            [this.toModelName, this.relatedName] = [
                normalizeModelReference(args[0]),
                args[1],
            ];
        }
    }

    getBackwardsFieldName(model) {
        return this.relatedName || reverseFieldName(model.modelName);
    }

    createBackwardsVirtualField(fieldName, model, toModel, throughModel) {
        const ThisField = this.getClass();
        return new ThisField(model.modelName, fieldName);
    }

    get installsBackwardsVirtualField() {
        return true;
    }

    get installsBackwardsDescriptor() {
        return true;
    }

    references(model) {
        return this.toModelName === model.modelName;
    }

    get installerClass() {
        return class AliasedForwardsDescriptorInstaller extends DefaultFieldInstaller {
            installForwardsDescriptor() {
                Object.defineProperty(
                    this.model.prototype,
                    this.field.as || this.fieldName, // use supplied name if possible
                    this.field.createForwardsDescriptor(
                        this.fieldName,
                        this.model,
                        this.toModel,
                        this.throughModel
                    )
                );
            }
        };
    }
}

export default RelationalField;
