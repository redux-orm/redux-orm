import RelationalField from "./RelationalField";

import { manyToManyDescriptor } from "../descriptors";

import { m2mName, m2mToFieldName, m2mFromFieldName } from "../utils";

/**
 * @memberof module:fields
 */
export class ManyToMany extends RelationalField {
    getDefault() {
        return [];
    }

    getThroughModelName(fieldName, model) {
        return this.through || m2mName(model.modelName, fieldName);
    }

    createForwardsDescriptor(fieldName, model, toModel, throughModel) {
        return manyToManyDescriptor(
            model.modelName,
            toModel.modelName,
            throughModel.modelName,
            this.getThroughFields(fieldName, model, toModel, throughModel),
            false
        );
    }

    createBackwardsDescriptor(fieldName, model, toModel, throughModel) {
        return manyToManyDescriptor(
            model.modelName,
            toModel.modelName,
            throughModel.modelName,
            this.getThroughFields(fieldName, model, toModel, throughModel),
            true
        );
    }

    createBackwardsVirtualField(fieldName, model, toModel, throughModel) {
        const ThisField = this.getClass();
        return new ThisField({
            to: model.modelName,
            relatedName: fieldName,
            through: throughModel.modelName,
            throughFields: this.getThroughFields(
                fieldName,
                model,
                toModel,
                throughModel
            ),
        });
    }

    createForwardsVirtualField(fieldName, model, toModel, throughModel) {
        const ThisField = this.getClass();
        return new ThisField({
            to: toModel.modelName,
            relatedName: fieldName,
            through: this.through,
            throughFields: this.getThroughFields(
                fieldName,
                model,
                toModel,
                throughModel
            ),
            as: this.as,
        });
    }

    get installsForwardsVirtualField() {
        return true;
    }

    getThroughFields(fieldName, model, toModel, throughModel) {
        if (this.throughFields) {
            const [fieldAName, fieldBName] = this.throughFields;
            const fieldA = throughModel.fields[fieldAName];
            return {
                to: fieldA.references(toModel) ? fieldAName : fieldBName,
                from: fieldA.references(toModel) ? fieldBName : fieldAName,
            };
        }

        if (model.modelName === toModel.modelName) {
            /**
             * we have no way of determining the relationship's
             * direction here, so we need to assume that the user
             * did not use a custom through model
             * see ORM#registerManyToManyModelsFor
             */
            return {
                to: m2mToFieldName(toModel.modelName),
                from: m2mFromFieldName(model.modelName),
            };
        }

        /**
         * determine which field references which model
         * and infer the directions from that
         */
        const throughModelFieldReferencing = (otherModel) =>
            Object.keys(throughModel.fields).find((someFieldName) =>
                throughModel.fields[someFieldName].references(otherModel)
            );

        return {
            to: throughModelFieldReferencing(toModel),
            from: throughModelFieldReferencing(model),
        };
    }
}

export default ManyToMany;
