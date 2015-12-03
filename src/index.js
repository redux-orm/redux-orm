import QuerySet from './QuerySet';
import Meta from './Meta';
import Model from './Model';
import Schema from './Schema';
import Session from './Session';
import {ForeignKey, ManyToMany} from './fields';

function fk(relatedModelName) {
    return new ForeignKey(relatedModelName);
}

function many(relatedModelName) {
    return new ManyToMany(relatedModelName);
}

export {
    QuerySet,
    Meta,
    Model,
    Schema,
    Session,
    ForeignKey,
    ManyToMany,
    fk,
    many,
};

export default Model;
