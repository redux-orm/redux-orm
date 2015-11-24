import {expect} from 'chai';
import Schema from '../Schema';
import EntityManager from '../EntityManager';
import QuerySet from '../QuerySet';

describe('QuerySet', () => {
    let stateTree;
    const schema = new Schema('people');
    const PersonManager = EntityManager.extend({
        schema: schema,
    });
    let personManager;
    let querySet;

    function getStateTree() {
        return {
            people: {
                people: [0, 1, 2],
                peopleById: {
                    0: {
                        name: 'Tommi',
                        age: 25,
                    },
                    1: {
                        name: 'John',
                        age: 50,
                    },
                    2: {
                        name: 'Mary',
                        age: 60,
                    },
                },
            },
        };
    }
    beforeEach(() => {
        stateTree = getStateTree();
        personManager = new PersonManager(stateTree.people);

        querySet = new QuerySet(personManager, personManager.getIdArray());
    });

    it('count works correctly', () => {
        expect(querySet.count()).to.equal(3);

        const empty = new QuerySet(personManager, []);
        expect(empty.count()).to.equal(0);
    });

    it('exists works correctly', () => {
        expect(querySet.exists()).to.equal(true);

        const empty = new QuerySet(personManager, []);
        expect(empty.exists()).to.equal(false);
    });

    it('at works correctly', () => {
        expect(querySet.at(0).toPlain()).to.deep.equal({id: 0, name: 'Tommi', age: 25});
        expect(querySet.at(2).toPlain()).to.deep.equal({id: 2, name: 'Mary', age: 60});
    });

    it('first works correctly', () => {
        expect(querySet.first()).to.deep.equal(querySet.at(0));
    });

    it('last works correctly', () => {
        expect(querySet.last()).to.deep.equal(querySet.at(2));
    });

    it('all works correctly', () => {
        const all = querySet.all();

        expect(all).not.to.equal(querySet);
        expect(all).to.deep.equal(querySet);
    });

    it('filter works correctly with object argument', () => {
        const filtered = querySet.filter({name: 'Tommi'});
        expect(filtered.count()).to.equal(1);
        expect(filtered.first().toPlain()).to.deep.equal({id: 0, name: 'Tommi', age: 25});
    });
});

