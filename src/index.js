import Manager from './Manager';
import QuerySet from './QuerySet';
import Meta from './Meta';
import Model from './Model';
import Schema from './Schema';
import Session from './Session';
import {ForeignKey, ManyToMany} from './fields';
import {extend, attachQuerySetMethods} from './utils';

function EntityManagerExtend(...args) {
    const cls = extend.call(Manager, ...args);
    const querySetClass = cls.prototype.querySetClass;

    const defaultSharedMethodNames = querySetClass.prototype.defaultSharedMethodNames;
    const additionalSharedMethodNames = querySetClass.prototype.sharedMethodNames;

    attachQuerySetMethods(cls.prototype, defaultSharedMethodNames);
    attachQuerySetMethods(cls.prototype, additionalSharedMethodNames);
    return cls;
}

Manager.extend = EntityManagerExtend;
QuerySet.extend = extend.bind(QuerySet);

function fk(relatedModelName) {
    return new ForeignKey(relatedModelName);
}

function many(relatedModelName) {
    return new ManyToMany(relatedModelName);
}

export {
    Manager,
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

export default Manager;
