import QuerySet from './QuerySet';
import Backend from './Backend';
import Model from './Model';
import Schema from './Schema';
import Session from './Session';
import {ForeignKey, ManyToMany, OneToOne} from './fields';

function fk(relatedModelName) {
    return new ForeignKey(relatedModelName);
}

function many(relatedModelName) {
    return new ManyToMany(relatedModelName);
}

function oneToOne(relatedModelName) {
    return new OneToOne(relatedModelName);
}

export {
    QuerySet,
    Backend,
    Model,
    Schema,
    Session,
    ForeignKey,
    ManyToMany,
    OneToOne,
    fk,
    many,
    oneToOne,
};

export default Model;
