import QuerySet from './QuerySet';
import Model from './Model';
import { DeprecatedSchema, ORM } from './ORM';
import Session from './Session';
import {
    createReducer,
    createSelector,
} from './redux';
import {
    ForeignKey,
    ManyToMany,
    OneToOne,
    fk,
    many,
    oneToOne,
    attr,
    Attribute,
} from './fields';

const Schema = DeprecatedSchema;

const Backend = function RemovedBackend() {
    throw new Error(
        'Having a custom Backend instance is now unsupported. ' +
        'Documentation for database customization is upcoming, for now ' +
        'please look at the db folder in the source.'
    );
};

export {
    Attribute,
    QuerySet,
    Model,
    ORM,
    Schema,
    Backend,
    Session,
    ForeignKey,
    ManyToMany,
    OneToOne,
    fk,
    many,
    attr,
    oneToOne,
    createReducer,
    createSelector,
};

export default Model;
