import MapSelectorSpec from "./MapSelectorSpec";
import ModelSelectorSpec from "./ModelSelectorSpec";
import ModelBasedSelectorSpec from "./ModelBasedSelectorSpec";
import idArgSelector from "./idArgSelector";

import QuerySet from "../QuerySet";
import Model from "../Model";

import ForeignKey from "../fields/ForeignKey";
import ManyToMany from "../fields/ManyToMany";

export default class FieldSelectorSpec extends ModelBasedSelectorSpec {
    constructor({ field, fieldModel, accessorName, isVirtual, ...other }) {
        super(other);
        this._field = field;
        this._fieldModel = fieldModel;
        this._accessorName = accessorName;
        this._isVirtual = isVirtual;
    }

    get key() {
        return this._accessorName;
    }

    get dependencies() {
        return [this._orm, idArgSelector];
    }

    valueForInstance(instance, session) {
        if (!instance) {
            return null;
        }
        let value;
        if (this._parent instanceof ModelSelectorSpec) {
            /* orm.Model.field */
            value = instance[this._accessorName];
        } else {
            /* orm.Model.field1.field2..fieldN.field */
            const { [this._parent.toModelName]: ParentToModel } = session;
            const parentRef = this._parent.valueForInstance(instance, session);
            const parentInstance = parentRef
                ? new ParentToModel(parentRef)
                : null;
            value = parentInstance ? parentInstance[this._accessorName] : null;
        }
        if (value instanceof Model) {
            return value.ref;
        }
        if (value instanceof QuerySet) {
            return value.toRefArray();
        }
        return value;
    }

    map(selector) {
        if (selector instanceof ModelSelectorSpec) {
            if (this.toModelName === selector.model.modelName) {
                throw new Error(
                    `Cannot select models in a \`map()\` call. If you just want the \`${this._accessorName}\` as a ref array then you can simply drop the \`map()\`. Otherwise make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`
                );
            } else {
                throw new Error(
                    `Cannot select \`${selector.model.modelName}\` models in this \`map()\` call. Make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`
                );
            }
        } else if (
            selector instanceof FieldSelectorSpec ||
            selector instanceof MapSelectorSpec
        ) {
            if (this.toModelName !== selector.model.modelName) {
                throw new Error(
                    `Cannot select fields of the \`${selector.model.modelName}\` model in this \`map()\` call. Make sure you're passing a field selector of the form \`${this.toModelName}.<field>\` or a custom selector instead.`
                );
            }
        } else if (
            !selector ||
            typeof selector !== "function" ||
            !selector.recomputations
        ) {
            throw new Error(
                `\`map()\` requires a selector as an input. Received: ${JSON.stringify(
                    selector
                )} of type ${typeof selector}`
            );
        }
        if (
            !(this._field instanceof ForeignKey) &&
            !(this._field instanceof ManyToMany)
        ) {
            throw new Error("Cannot map selectors for non-collection fields");
        }
        return new MapSelectorSpec({
            parent: this,
            model: this._model,
            orm: this._orm,
            field: this._field,
            selector,
        });
    }

    get toModelName() {
        return this._field.toModelName === "this"
            ? this._fieldModel.modelName
            : this._field.toModelName;
    }

    get toModel() {
        const db = this._orm.getDatabase();
        return db.describe(this.toModelName);
    }
}
