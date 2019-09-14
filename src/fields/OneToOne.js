import RelationalField from './RelationalField';

import {
    forwardsOneToOneDescriptor,
    backwardsOneToOneDescriptor,
} from '../descriptors';

/**
 * @private
 */
export class OneToOne extends RelationalField {
    getBackwardsFieldName(model) {
        return (
            this.relatedName ||
            model.modelName.toLowerCase()
        );
    }

    createForwardsDescriptor(fieldName, model, toModel, throughModel) {
        return forwardsOneToOneDescriptor(fieldName, toModel.modelName);
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel) {
        return backwardsOneToOneDescriptor(fieldName, model.modelName);
    }
}

export default OneToOne;
