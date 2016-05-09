import chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const { expect } = chai;
import Backend from '../Backend';
import { ListIterator } from '../utils';

describe('Backend', () => {
    describe('prototype methods', () => {
        const state = {
            items: [0, 1, 2],
            itemsById: {
                0: {
                    id: 0,
                    data: 'cooldata',
                },
                1: {
                    id: 1,
                    data: 'verycooldata!',
                },
                2: {
                    id: 2,
                    data: 'awesomedata',
                },
            },
        };
        const mockTx = { meta: {}, onClose() {} };
        const backend = new Backend();

        it('correctly accesses an id', () => {
            expect(backend.accessId(state, 1)).to.equal(state.itemsById[1]);
        });

        it('correctly accesses id\'s', () => {
            expect(backend.accessIdList(state)).to.equal(state.items);
        });

        it('correctly returns an iterator', () => {
            const iterator = backend.iterator(state);
            expect(iterator).to.be.an.instanceOf(ListIterator);

            let iteratorIndex = 0;
            const times = state.items.length;
            let done = false;
            while (iteratorIndex < times) {
                if (iteratorIndex === times - 1) done = true;
                expect(iterator.next()).to.deep.equal({
                    value: state.itemsById[iteratorIndex],
                    done: done,
                });
                iteratorIndex++;
            }
        });

        it('correctly returns a default state', () => {
            expect(backend.getDefaultState()).to.deep.equal({
                items: [],
                itemsById: {},
            });
        });

        it('correctly inserts an entry', () => {
            const entry = {id: 3, data: 'newdata!'};
            const newState = backend.insert(mockTx, state, entry);

            expect(newState).to.not.equal(state);
            expect(newState.items).to.deep.equal([0, 1, 2, 3]);
            expect(newState.itemsById).to.deep.equal({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
                1: {
                    id: 1,
                    data: 'verycooldata!',
                },
                2: {
                    id: 2,
                    data: 'awesomedata',
                },
                3: {
                    id: 3,
                    data: 'newdata!',
                },
            });
        });

        it('correctly updates entries with a merging object', () => {
            const toMergeObj = {data: 'modifiedData'};
            const idsToUpdate = [1, 2];
            const newState = backend.update(mockTx, state, idsToUpdate, toMergeObj);

            expect(newState).to.not.equal(state);
            expect(newState.items).to.equal(state.items);
            expect(newState.itemsById).to.deep.equal({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
                1: {
                    id: 1,
                    data: 'modifiedData',
                },
                2: {
                    id: 2,
                    data: 'modifiedData',
                },
            });
        });

        it('correctly deletes entries', () => {
            const idsToDelete = [1, 2];
            const newState = backend.delete(mockTx, state, idsToDelete);

            expect(newState).to.not.equal(state);
            expect(newState.items).to.deep.equal([0]);
            expect(newState.itemsById).to.deep.equal({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
            });
        });
    });
});
