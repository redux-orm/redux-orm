import ForeignKey from "../fields/ForeignKey";
import ManyToMany from "../fields/ManyToMany";
import RelationalField from "../fields/RelationalField";

import FieldSelectorSpec from "./FieldSelectorSpec";
import ModelSelectorSpec from "./ModelSelectorSpec";

/**
 * @module selectors
 * @private
 */

export function createFieldSelectorSpec({
    parent,
    model,
    field,
    fieldModel,
    accessorName,
    orm,
    isVirtual,
}) {
    const fieldSelectorSpec = new FieldSelectorSpec({
        parent,
        model,
        field,
        fieldModel,
        accessorName,
        orm,
        isVirtual,
    });
    /* Do not even try to create field selectors below attributes. */
    if (!(field instanceof RelationalField)) {
        // "orm.Author.name.publisher" would be nonsense
        return fieldSelectorSpec;
    }
    /* Prevent field selectors below collections. */
    if (parent instanceof FieldSelectorSpec) {
        /* eslint-disable no-underscore-dangle */
        if (
            // "orm.Author.books.publisher" would be nonsense
            (parent._field instanceof ForeignKey && parent._isVirtual) ||
            // "orm.Genre.books.publisher" would be nonsense
            parent._field instanceof ManyToMany
        ) {
            throw new Error(
                `Cannot create a selector for \`${parent._accessorName}.${accessorName}\` because \`${parent._accessorName}\` is a collection field.`
            );
        }
    }
    const { toModelName } = field;
    const toModel = orm.get(
        toModelName === "this" ? model.modelName : toModelName
    );
    Object.entries(toModel.fields).forEach(
        ([relatedFieldName, relatedField]) => {
            const fieldAccessorName = relatedField.as || relatedFieldName;
            Object.defineProperty(fieldSelectorSpec, fieldAccessorName, {
                get: () =>
                    createFieldSelectorSpec({
                        parent: fieldSelectorSpec,
                        model,
                        fieldModel: toModel,
                        field: relatedField,
                        accessorName: fieldAccessorName,
                        orm,
                        isVirtual: false,
                    }),
            });
        }
    );
    Object.entries(toModel.virtualFields).forEach(
        ([relatedFieldName, relatedField]) => {
            const fieldAccessorName = relatedField.as || relatedFieldName;
            if (fieldSelectorSpec.hasOwnProperty(fieldAccessorName)) {
                return;
            }
            Object.defineProperty(fieldSelectorSpec, fieldAccessorName, {
                get: () =>
                    createFieldSelectorSpec({
                        parent: fieldSelectorSpec,
                        model,
                        fieldModel: toModel,
                        field: relatedField,
                        accessorName: fieldAccessorName,
                        orm,
                        isVirtual: true,
                    }),
            });
        }
    );
    return fieldSelectorSpec;
}

export function createModelSelectorSpec({ model, orm }) {
    const modelSelectorSpec = new ModelSelectorSpec({
        parent: null,
        orm,
        model,
    });

    Object.entries(model.fields).forEach(([fieldName, field]) => {
        const fieldAccessorName = field.as || fieldName;
        Object.defineProperty(modelSelectorSpec, fieldAccessorName, {
            get: () =>
                createFieldSelectorSpec({
                    parent: modelSelectorSpec,
                    model,
                    fieldModel: model,
                    field,
                    accessorName: fieldAccessorName,
                    orm,
                    isVirtual: false,
                }),
        });
    });

    Object.entries(model.virtualFields).forEach(([fieldName, field]) => {
        const fieldAccessorName = field.as || fieldName;
        if (modelSelectorSpec.hasOwnProperty(fieldAccessorName)) {
            return;
        }
        Object.defineProperty(modelSelectorSpec, fieldAccessorName, {
            get: () =>
                createFieldSelectorSpec({
                    parent: modelSelectorSpec,
                    model,
                    fieldModel: model,
                    field,
                    accessorName: fieldAccessorName,
                    orm,
                    isVirtual: true,
                }),
        });
    });

    return modelSelectorSpec;
}
