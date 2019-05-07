import {
    ORM, Session, createSelector
} from '../..';
import { createTestModels, avg } from '../helpers';

describe('Shorthand selector specifications', () => {
    let orm;
    let reducer;
    let emptyState;
    let ormState;
    const stateSelector = () => ormState;
    let Book;
    let Cover;
    let Genre;
    let Tag;
    let Author;
    let Publisher;
    let Movie;

    const CREATE_MOVIE = 'CREATE_MOVIE';
    const CREATE_PUBLISHER = 'CREATE_PUBLISHER';

    beforeEach(() => {
        ({
            Book,
            Cover,
            Genre,
            Tag,
            Author,
            Movie,
            Publisher,
        } = createTestModels());
        orm = new ORM({ stateSelector });
        orm.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        reducer = (state, action) => {
            const session = orm.session(state || orm.getEmptyState());
            switch (action.type) {
            case CREATE_MOVIE:
                session.Movie.create(action.payload);
                break;
            case CREATE_PUBLISHER:
                session.Publisher.create(action.payload);
                break;
            default: break;
            }
            return session.state;
        };
        emptyState = orm.getEmptyState();
        ormState = emptyState;
    });

    it('throws for invalid arguments', () => {
        expect(() => {
            createSelector();
        }).toThrow('Cannot create a selector without arguments.');
        expect(() => {
            createSelector(undefined);
        }).toThrow('Failed to interpret selector argument: undefined');
        expect(() => {
            createSelector(null);
        }).toThrow('Failed to interpret selector argument: null');
        expect(() => {
            createSelector({});
        }).toThrow('Failed to interpret selector argument: {}');
        expect(() => {
            createSelector([]);
        }).toThrow('Failed to interpret selector argument: []');
        expect(() => {
            createSelector(1);
        }).toThrow('Failed to interpret selector argument: 1');
        expect(() => {
            createSelector('a');
        }).toThrow('Failed to interpret selector argument: "a"');
    });

    describe('model selector specs', () => {
        it('will recompute single model instances', () => {
            const publishers = createSelector(orm.Publisher);
            expect(publishers(emptyState, 1)).toEqual(null);
            expect(publishers.recomputations()).toEqual(1);
            expect(publishers(emptyState, 1)).toEqual(null);
            expect(publishers.recomputations()).toEqual(1);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                },
            });
            expect(publishers(ormState, 1)).toEqual({
                id: 1,
            });
            expect(publishers.recomputations()).toEqual(2);
        });

        it('will recompute some model instances by ID array', () => {
            const publishers = createSelector(orm.Publisher);
            expect(publishers(emptyState, [])).toEqual([]);
            expect(publishers.recomputations()).toEqual(1);
            expect(publishers(emptyState, [])).toEqual([]);
            expect(publishers.recomputations()).toEqual(2);
            const zeroAndTwo = [0, 2];
            expect(publishers(emptyState, zeroAndTwo)).toEqual([]);
            expect(publishers.recomputations()).toEqual(3);
            expect(publishers(emptyState, zeroAndTwo)).toEqual([]);
            expect(publishers.recomputations()).toEqual(3);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                },
            });
            expect(publishers(ormState, zeroAndTwo)).toEqual([]);
            /**
            * Note that the above only recomputes because we need to
            * perform a full-table scan there, even if we knew before
            * exactly which IDs we wanted to access. This should
            * be fixable by allowing arrays as filter arguments.
            */
            expect(publishers.recomputations()).toEqual(4);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                },
            });
            expect(publishers(ormState, zeroAndTwo)).toHaveLength(1);
            expect(publishers.recomputations()).toEqual(5);
            expect(publishers(ormState, zeroAndTwo)).toHaveLength(1);
            expect(publishers.recomputations()).toEqual(5);
        });

        it('will recompute all model instances', () => {
            const publishers = createSelector(orm.Publisher);
            expect(publishers(emptyState)).toEqual([]);
            expect(publishers.recomputations()).toEqual(1);
            expect(publishers(emptyState)).toEqual([]);
            expect(publishers.recomputations()).toEqual(1);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                },
            });
            expect(publishers(ormState)).toEqual([
                { id: 1 }
            ]);
            expect(publishers.recomputations()).toEqual(2);
        });
    });

    describe('field selector specs', () => {
        it('will recompute attr fields for single model instances', () => {
            const publisherNames = createSelector(orm.Publisher.name);
            expect(publisherNames(emptyState, 1)).toEqual(null);
            expect(publisherNames.recomputations()).toEqual(1);
            expect(publisherNames(emptyState, 1)).toEqual(null);
            expect(publisherNames.recomputations()).toEqual(1);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: 'Publisher name!'
                },
            });
            expect(publisherNames(ormState, 1)).toEqual('Publisher name!');
            expect(publisherNames.recomputations()).toEqual(2);
        });

        /*
        it('will compute related models for single model instances', () => {
            const publisherMovies = createSelector(orm.Publisher.movies);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisher: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisher: 123 }
            ]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 2,
                    publisher: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisher: 123 },
                { id: 2, publisher: 123 },
            ]);
        });
        */

        it('will recompute attr fields for some model instances', () => {
            const publisherNames = createSelector(orm.Publisher.name);
            expect(publisherNames(emptyState, [])).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(1);
            expect(publisherNames(emptyState, [])).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(2);
            const zeroAndTwo = [0, 2];
            expect(publisherNames(emptyState, zeroAndTwo)).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(3);
            expect(publisherNames(emptyState, zeroAndTwo)).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(3);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: 'Publisher name!'
                },
            });
            expect(publisherNames(ormState, zeroAndTwo)).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(4);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: 'Other publisher name!'
                },
            });
            expect(publisherNames(ormState, zeroAndTwo)).toEqual(['Other publisher name!']);
            expect(publisherNames.recomputations()).toEqual(5);
        });

        it('will recompute attr fields for all model instances', () => {
            const publisherNames = createSelector(orm.Publisher.name);
            expect(publisherNames(emptyState)).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(1);
            expect(publisherNames(emptyState)).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(1);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: 'Publisher name!'
                },
            });
            expect(publisherNames(ormState)).toEqual(['Publisher name!']);
            expect(publisherNames.recomputations()).toEqual(2);
        });

        /*
        it('will compute related models', () => {
            // The way we have to do it right now.
            const old = createSelector(
                orm,
                (state, id) => id,
                ({ Publisher }, id) => (
                    avg(Publisher.withId(id).movies.map(movie => movie.rating))
                ),
            );
            // This is the desired new functionality.
            const publisherRatingAvg = createSelector(
                orm.Publisher.movies,
                (_, movies) => avg(movies.map(movie => movie.rating))
            );
            expect(() => publisherRatingAvg(emptyState, 0))
                .toThrow('Publisher with id 0 doesn\'t exist');
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherRatingAvg(ormState, 123)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisher: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisher: 123,
                },
            });
            expect(publisherRatingAvg(ormState, 123)).toEqual(6.5);
        });
        */
    });
});
