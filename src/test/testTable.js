import chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const { expect } = chai;
import Table from '../db/Table';
import { ListIterator, getBatchToken } from '../utils';

describe('Table', () => {
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
        const batchToken = getBatchToken();
        const txInfo = { batchToken, withMutations: false };
        const table = new Table();

        it('correctly accesses an id', () => {
            expect(table.accessId(state, 1)).to.equal(state.itemsById[1]);
        });

        it('correctly accesses id\'s', () => {
            expect(table.accessIdList(state)).to.equal(state.items);
        });

        it('correctly returns an iterator', () => {
            const iterator = table.iterator(state);
            expect(iterator).to.be.an.instanceOf(ListIterator);

            let iteratorIndex = 0;
            const times = state.items.length;
            let done = false;
            while (iteratorIndex < times) {
                if (iteratorIndex === times - 1) done = true;
                expect(iterator.next()).to.deep.equal({
                    value: state.itemsById[iteratorIndex],
                    done,
                });
                iteratorIndex++;
            }
        });

        it('correctly returns a default state', () => {
            expect(table.getDefaultState()).to.deep.equal({
                items: [],
                itemsById: {},
                meta: {},
            });
        });

        it('correctly inserts an entry', () => {
            const entry = { id: 3, data: 'newdata!' };
            const newState = table.insert(txInfo, state, entry);

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
            const toMergeObj = { data: 'modifiedData' };
            const idsToUpdate = [1, 2];
            const newState = table.update(txInfo, state, idsToUpdate, toMergeObj);

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
            const newState = table.delete(txInfo, state, idsToDelete);

            expect(newState).to.not.equal(state);
            expect(newState.items).to.deep.equal([0]);
            expect(newState.itemsById).to.deep.equal({
                0: {
                    id: 0,
                    data: 'cooldata',
                },
            });
        });

        // it('filter works correctly with object argument', () => {
        //     const filterDescriptor = { type: FILTER, payload: { name: 'Clean Code' }};
        //     const filtered = bookQs.withRefs.filter({ name: 'Clean Code' });
        //     expect(filtered.count()).to.equal(1);
        //     expect(filtered.ref.first()).to.equal(session.Book.state.itemsById[1]);
        // });

        // it('filter works correctly with object argument, with model instance value', () => {
        //     const filtered = bookQs.withRefs.filter({
        //         author: session.Author.withId(0),
        //     });
        //     expect(filtered.count()).to.equal(1);
        //     expect(filtered.ref.first()).to.equal(session.Book.state.itemsById[0]);
        // });

        // it('orderBy works correctly with prop argument', () => {
        //     const ordered = bookQs.orderBy(['releaseYear']);
        //     expect(ordered.idArr).to.deep.equal([1, 2, 0]);
        // });

        // it('orderBy works correctly with function argument', () => {
        //     const ordered = bookQs.orderBy([(book) => book.releaseYear]);
        //     expect(ordered.idArr).to.deep.equal([1, 2, 0]);
        // });

        // it('exclude works correctly with object argument', () => {
        //     const excluded = bookQs.exclude({ name: 'Clean Code' });
        //     expect(excluded.count()).to.equal(2);
        //     expect(excluded.idArr).to.deep.equal([0, 2]);
        // });
    });
});
