const Field = class Field {
    constructor(toModelName, relatedName) {
        this.toModelName = toModelName;
        this.relatedName = relatedName;
    }
};

export const ForeignKey = class ForeignKey extends Field {};
export const ManyToMany = class ManyToMany extends Field {};
export const OneToOne = class OneToOne extends Field {};

export function fk(...args) {
    return new ForeignKey(...args);
}

export function many(...args) {
    return new ManyToMany(...args);
}

export function oneToOne(...args) {
    return new OneToOne(...args);
}
