/**
 * Defines algorithm for installing a field onto a model and related models.
 * Conforms to the template method behavioral design pattern.
 * @private
 * @memberof module:fields
 */
export class FieldInstallerTemplate {
    constructor(opts) {
        this.field = opts.field;
        this.fieldName = opts.fieldName;
        this.model = opts.model;
        this.orm = opts.orm;
        /**
         * the field itself has no knowledge of the model
         * it is being installed upon; we need to inform it
         * that it is a self-referencing field for the field
         * to be able to make better informed decisions
         */
        if (this.field.references(this.model)) {
            this.field.toModelName = "this";
        }
    }

    get toModel() {
        if (typeof this._toModel === "undefined") {
            const { toModelName } = this.field;
            if (!toModelName) {
                this._toModel = null;
            } else if (toModelName === "this") {
                this._toModel = this.model;
            } else {
                this._toModel = this.orm.get(toModelName);
            }
        }
        return this._toModel;
    }

    get throughModel() {
        if (typeof this._throughModel === "undefined") {
            const throughModelName = this.field.getThroughModelName(
                this.fieldName,
                this.model
            );
            if (!throughModelName) {
                this._throughModel = null;
            } else {
                this._throughModel = this.orm.get(throughModelName);
            }
        }
        return this._throughModel;
    }

    get backwardsFieldName() {
        return this.field.getBackwardsFieldName(this.model);
    }

    run() {
        this.installForwardsDescriptor();
        if (this.field.installsForwardsVirtualField) {
            this.installForwardsVirtualField();
        }
        /**
         * Install a backwards field on a model as a consequence
         * of having installed the forwards field on another model.
         */
        if (this.field.installsBackwardsDescriptor) {
            this.installBackwardsDescriptor();
        }
        if (this.field.installsBackwardsVirtualField) {
            this.installBackwardsVirtualField();
        }
    }
}

export default FieldInstallerTemplate;
