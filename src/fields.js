export const Relationship = class Relationship {
    constructor(toModelName, relatedName) {
        this.toModelName = toModelName;
        this.relatedName = relatedName;
    }
};

export const Attribute = class Attribute {
    constructor(description = {}) {
        this.description = description;
    }

    get defaultValue() {
        return this.description.defaultValue;
    }
};

export const ForeignKey = class ForeignKey extends Relationship {};
export const ManyToMany = class ManyToMany extends Relationship {};
export const OneToOne = class OneToOne extends Relationship {};

export function fk(...args) {
    return new ForeignKey(...args);
}

export function many(...args) {
    return new ManyToMany(...args);
}

export function oneToOne(...args) {
    return new OneToOne(...args);
}

export function attribute(...args) {
    return new Attribute(...args);
}
