const Field = class Field {
    constructor(toModelName, relatedName) {
        this.toModelName = toModelName;
        this.relatedName = relatedName;
    }
};

const ForeignKey = class ForeignKey extends Field {};
const ManyToMany = class ManyToMany extends Field {};
const OneToOne = class OneToOne extends Field {};

export {
    ForeignKey,
    ManyToMany,
    OneToOne,
};
