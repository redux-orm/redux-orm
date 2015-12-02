const Field = class Field {
    constructor(toModelName) {
        this.toModelName = toModelName;
    }
};

const ForeignKey = class ForeignKey extends Field {
};

const ManyToMany = class ManyToMany extends Field {

};

export {ForeignKey, ManyToMany};
