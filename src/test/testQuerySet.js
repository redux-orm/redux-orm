import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);
const {expect} = chai;

import Model from '../Model';
import Schema from '../Schema';
import QuerySet from '../QuerySet';
import {
    UPDATE,
    DELETE,
} from '../constants';

describe('QuerySet', () => {
    let modelClassMock;

    let PersonClass;

    const state = {
        Person: {
            items: [0, 1, 2],
            itemsById: {
                0: {
                    id: 0,
                    name: 'Tommi',
                    age: 25,
                },
                1: {
                    id: 1,
                    name: 'John',
                    age: 50,
                },
                2: {
                    id: 2,
                    name: 'Mary',
                    age: 60,
                },
            },
        },
    };
    let schema;
    let session;
    let qs;
    beforeEach(() => {
        schema = new Schema();
        // Start off with a fresh Model class for each
        // test.
        PersonClass = class Person extends Model {};
        PersonClass.backend = {name: 'Person'};
        schema.register(PersonClass);
        session = schema.from(state);
        qs = session.Person.query;
    });

    it('count works correctly', () => {
        expect(qs.count()).to.equal(3);
        const emptyQs = new QuerySet(session.Person, []);
        expect(emptyQs.count()).to.equal(0);
    });

    it('exists works correctly', () => {
        expect(qs.exists()).to.equal(true);

        const empty = new QuerySet(session.Person, []);
        expect(empty.exists()).to.equal(false);
    });

    it('at works correctly', () => {
        expect(qs.plain.at(0)).to.equal(state.Person.itemsById[0]);
        expect(qs.plain.at(2)).to.equal(state.Person.itemsById[2]);

        expect(qs.at(0)).to.deep.equal({id: 0, name: 'Tommi', age: 25});
    });

    it('first works correctly', () => {
        expect(qs.first()).to.deep.equal(qs.at(0));
        expect(qs.plain.first()).to.deep.equal(qs.at(0));
    });

    it('last works correctly', () => {
        expect(qs.last()).to.deep.equal(qs.at(2));
        expect(qs.plain.last()).to.equal(state.Person.itemsById[2]);
    });

    it('all works correctly', () => {
        const all = qs.all();

        expect(all).not.to.equal(qs);
        expect(all.idArr).to.deep.equal(qs.idArr);
    });

    it('filter works correctly with object argument', () => {
        const filtered = qs.plain.filter({name: 'Tommi'});
        expect(filtered.count()).to.equal(1);
        expect(filtered.first()).to.equal(state.Person.itemsById[0]);
    });

    it('exclude works correctly with object argument', () => {
        const excluded = qs.exclude({name: 'Tommi'});
        expect(excluded.count()).to.equal(2);
        expect(excluded.idArr).to.deep.equal([1, 2]);
    });

    it('update records a mutation', () => {
        const updater = {name: 'Mark'};
        expect(session.mutations).to.have.length(0);
        qs.update(updater);
        expect(session.mutations).to.have.length(1);

        expect(session.mutations[0]).to.deep.equal({
            type: UPDATE,
            payload: {
                idArr: qs.idArr,
                updater,
            },
            backend: {
                name: 'Person',
            },
        });
    });

    it('delete records a mutation', () => {
        expect(session.mutations).to.have.length(0);
        qs.delete();
        expect(session.mutations).to.have.length(1);

        expect(session.mutations[0]).to.deep.equal({
            type: DELETE,
            payload: qs.idArr,
            backend: {
                name: 'Person',
            },
        });
    });

    it('custom methods works', () => {
        class CustomQuerySet extends QuerySet {
            overMiddleAge() {
                const origPlain = this._plain;
                const filtered = this.plain.filter(person => person.age > 50);
                return origPlain ? filtered : filtered.models;
            }
        }
        CustomQuerySet.addSharedMethod('overMiddleAge');

        class PersonSub extends PersonClass {}

        PersonSub.backend = {name: 'Person'};
        PersonSub.querySetClass = CustomQuerySet;
        const aSchema = new Schema();
        aSchema.register(PersonSub);
        const sess = aSchema.from(state);
        const customQs = sess.Person.query;

        const overMiddleAged = customQs.overMiddleAge();
        expect(overMiddleAged.count()).to.equal(1);
        expect(overMiddleAged.first().toPlain()).to.deep.equal({id: 2, name: 'Mary', age: 60});

        expect(PersonSub.overMiddleAge().count()).to.equal(1);
        expect(PersonSub.plain.filter({name: 'Tommi'}).count()).to.equal(1);
    });
});

