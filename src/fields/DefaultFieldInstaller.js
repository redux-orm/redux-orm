import FieldInstallerTemplate from "./FieldInstallerTemplate";

import { reverseFieldErrorMessage } from "../utils";

/**
 * Default implementation for the template method in FieldInstallerTemplate.
 * @private
 * @memberof module:fields
 */
export class DefaultFieldInstaller extends FieldInstallerTemplate {
    installForwardsDescriptor() {
        Object.defineProperty(
            this.model.prototype,
            this.fieldName,
            this.field.createForwardsDescriptor(
                this.fieldName,
                this.model,
                this.toModel,
                this.throughModel
            )
        );
    }

    installForwardsVirtualField() {
        this.model.virtualFields[
            this.fieldName
        ] = this.field.createForwardsVirtualField(
            this.fieldName,
            this.model,
            this.toModel,
            this.throughModel
        );
    }

    installBackwardsDescriptor() {
        const backwardsDescriptor = Object.getOwnPropertyDescriptor(
            this.toModel.prototype,
            this.backwardsFieldName
        );
        if (backwardsDescriptor) {
            throw new Error(
                reverseFieldErrorMessage(
                    this.model.modelName,
                    this.fieldName,
                    this.toModel.modelName,
                    this.backwardsFieldName
                )
            );
        }

        // install backwards descriptor
        Object.defineProperty(
            this.toModel.prototype,
            this.backwardsFieldName,
            this.field.createBackwardsDescriptor(
                this.fieldName,
                this.model,
                this.toModel,
                this.throughModel
            )
        );
    }

    installBackwardsVirtualField() {
        this.toModel.virtualFields[
            this.backwardsFieldName
        ] = this.field.createBackwardsVirtualField(
            this.fieldName,
            this.model,
            this.toModel,
            this.throughModel
        );
    }
}

export default DefaultFieldInstaller;
