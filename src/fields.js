const Field = class Field {
    constructor(...args) {
        if (args.length === 1 && typeof args[0] === 'object') {
            const opts = args[0];
            this.toModelName = opts.to;
            this.relatedName = opts.relatedName;
            this.through = opts.through;
        } else {
            this.toModelName = args[0];
            this.relatedName = args[1];
        }
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
