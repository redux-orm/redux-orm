const Field = class Field {
    constructor(toModelName) {
        this.toModelName = toModelName;
    }
};

const ForeignKey = class ForeignKey extends Field {};
const ManyToMany = class ManyToMany extends Field {};
const OneToOne = class OneToOne extends Field {};

export {ForeignKey, ManyToMany, OneToOne};
