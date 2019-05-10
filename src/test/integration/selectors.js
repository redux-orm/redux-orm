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
    const CREATE_BOOK = 'CREATE_BOOK';
    const CREATE_COVER = 'CREATE_COVER';
    const CREATE_AUTHOR = 'CREATE_AUTHOR';

    const consoleWarn = jest.spyOn(global.console, 'warn')
        .mockImplementation(msg => msg);

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
            case CREATE_BOOK:
                session.Book.create(action.payload);
                break;
            case CREATE_COVER:
                session.Cover.create(action.payload);
                break;
            case CREATE_AUTHOR:
                session.Author.create(action.payload);
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
        }).toThrow('Failed to interpret selector argument: undefined of type undefined');
        expect(() => {
            createSelector(null);
        }).toThrow('Failed to interpret selector argument: null of type object');
        expect(() => {
            createSelector({});
        }).toThrow('Failed to interpret selector argument: {} of type object');
        expect(() => {
            createSelector([]);
        }).toThrow('Failed to interpret selector argument: [] of type object');
        expect(() => {
            createSelector(1);
        }).toThrow('Failed to interpret selector argument: 1 of type number');
        expect(() => {
            createSelector('a');
        }).toThrow('Failed to interpret selector argument: "a" of type string');
    });

    it('handles ORM instances and selector specs correctly', () => {
        expect(() => {
            createSelector(orm);
        }).toThrow('ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`.');
        expect(() => {
            createSelector(() => {}, orm);
        }).toThrow('ORM instances cannot be the result function of selectors. You can access your models in the last function that you pass to `createSelector()`.');
        expect(() => {
            createSelector(() => {});
        }).toThrow('Failed to resolve the current ORM database state. Please pass an ORM instance or an ORM selector as an argument to `createSelector()`.');
        const ormWithoutStateSelector = new ORM();
        expect(() => {
            createSelector(ormWithoutStateSelector, () => {});
        }).toThrow('Failed to resolve the current ORM database state. Please pass an object to the ORM constructor that specifies a `stateSelector` function.');
        const ormWithInvalidStateSelector = new ORM({
            stateSelector: 'I should be a function',
        });
        expect(() => {
            createSelector(ormWithInvalidStateSelector, () => {});
        }).toThrow('Failed to resolve the current ORM database state. Please pass a function when specifying the ORM\'s `stateSelector`. Received: "I should be a function" of type string');
    });

    it('warns when ignoring selectors', () => {
        expect(consoleWarn).toHaveBeenCalledTimes(0);
        createSelector(() => {}, orm.Publisher);
        expect(consoleWarn).toHaveBeenCalledTimes(1);
        expect(consoleWarn.mock.results[0].value).toEqual('Your input selectors will be ignored: the passed result function does not require any input.');
    });

    it('caches spec-based selectors by ORM', () => {
        const authors = createSelector(orm.Author);
        const _authors = createSelector(orm.Author);
        expect(authors).toBe(_authors);

        /**
         * FIXME: Two concurrent ORMs are impossible to create.
         * They throw when trying to redefine field properties.
         *
         * Maybe this is fixable by defining isSetup on model classes directly.
         */
        /**
        const orm2 = new ORM({ stateSelector });
        orm2.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        const authors2 = createSelector(orm2.Author);
        const _authors2 = createSelector(orm2.Author);
        expect(authors2).toBe(_authors2);

        expect(authors).not.toBe(authors2);
        */
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

    describe('attr field selector specs', () => {
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

        it('will recompute attr fields for some model instances', () => {
            const publisherNames = createSelector(orm.Publisher.name);
            expect(publisherNames(emptyState, [])).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(1);
            expect(publisherNames(emptyState, [])).toEqual([]);
            expect(publisherNames.recomputations()).toEqual(2);
            const zeroAndTwo = [0, 2];
            expect(publisherNames(emptyState, zeroAndTwo))
                .toEqual([null, null]);
            expect(publisherNames.recomputations()).toEqual(3);
            expect(publisherNames(emptyState, zeroAndTwo))
                .toEqual([null, null]);
            expect(publisherNames.recomputations()).toEqual(3);
            ormState = reducer(emptyState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 1,
                    name: 'Publisher name!'
                },
            });
            expect(publisherNames(ormState, zeroAndTwo))
                .toEqual([null, null]);
            expect(publisherNames.recomputations()).toEqual(4);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 2,
                    name: 'Other publisher name!'
                },
            });
            expect(publisherNames(ormState, zeroAndTwo))
                .toEqual([null, 'Other publisher name!']);
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
    });

    describe('foreign key field selector specs', () => {
        it('will compute forward FK model for single model instances', () => {
            const moviePublisher = createSelector(orm.Movie.publisher);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(moviePublisher(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(moviePublisher(ormState, 1)).toEqual({
                id: 123,
            });
        });

        it('will compute backward FK models for single model instances', () => {
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
                    publisherId: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisherId: 123 }
            ]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 2,
                    publisherId: 123,
                },
            });
            expect(publisherMovies(ormState, 123)).toEqual([
                { id: 1, publisherId: 123 },
                { id: 2, publisherId: 123 },
            ]);
        });
    });

    describe('one to one field selector specs', () => {
        it('will compute forward oneToOne model for single model instances', () => {
            const bookCover = createSelector(orm.Book.cover);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(bookCover(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(bookCover(ormState, 1)).toEqual({
                id: 123,
            });
        });

        it('will compute forward oneToOne model for some model instances', () => {
            const bookCover = createSelector(orm.Book.cover);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(bookCover(ormState, [1])).toEqual([null]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(bookCover(ormState, [1])).toEqual([{
                id: 123,
            }]);
        });

        it('will compute forward oneToOne model for all model instances', () => {
            const bookCover = createSelector(orm.Book.cover);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(bookCover(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(bookCover(ormState)).toEqual([{
                id: 123,
            }]);
        });

        it('will compute backward oneToOne model for single model instances', () => {
            const coverBook = createSelector(orm.Cover.book);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(coverBook(ormState, 123)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(coverBook(ormState, 123)).toEqual({
                id: 1,
                cover: 123,
            });
        });

        it('will compute backward oneToOne model for some model instances', () => {
            const coverBook = createSelector(orm.Cover.book);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(coverBook(ormState, [123])).toEqual([null]);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(coverBook(ormState, [123])).toEqual([{
                id: 1,
                cover: 123,
            }]);
        });

        it('will compute backward oneToOne model for all model instances', () => {
            const coverBook = createSelector(orm.Cover.book);
            ormState = reducer(ormState, {
                type: CREATE_BOOK,
                payload: {
                    id: 1,
                    cover: 123,
                },
            });
            expect(coverBook(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_COVER,
                payload: {
                    id: 123,
                },
            });
            expect(coverBook(ormState)).toEqual([{
                id: 1,
                cover: 123,
            }]);
        });
    });

    describe('many to many field selector specs', () => {
        it('will compute forward manyToMany models for single model instances', () => {
            const authorPublishers = createSelector(orm.Author.publishers);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(authorPublishers(ormState, 1)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(authorPublishers(ormState, 1)).toEqual([{
                id: 123,
            }]);
        });

        it('will compute forward manyToMany models for some model instances', () => {
            const authorPublishers = createSelector(orm.Author.publishers);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(authorPublishers(ormState, [1])).toEqual([null]);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(authorPublishers(ormState, [1])).toEqual([
                [{
                    id: 123,
                }]
            ]);
        });

        it('will compute forward manyToMany models for all model instances', () => {
            const authorPublishers = createSelector(orm.Author.publishers);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(authorPublishers(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(authorPublishers(ormState)).toEqual([
                [{
                    id: 123,
                }]
            ]);
        });

        it('will compute backward manyToMany models for single model instances', () => {
            const publisherAuthors = createSelector(orm.Publisher.authors);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(publisherAuthors(ormState, 123)).toEqual(null);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAuthors(ormState, 123)).toEqual([{
                id: 1,
            }]);
        });

        it('will compute backward manyToMany models for some model instances', () => {
            const publisherAuthors = createSelector(orm.Publisher.authors);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(publisherAuthors(ormState, [123])).toEqual([null]);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAuthors(ormState, [123])).toEqual([
                [{
                    id: 1,
                }]
            ]);
        });

        it('will compute backward manyToMany models for all model instances', () => {
            const publisherAuthors = createSelector(orm.Publisher.authors);
            ormState = reducer(ormState, {
                type: CREATE_AUTHOR,
                payload: {
                    id: 1,
                    publishers: [123],
                },
            });
            expect(publisherAuthors(ormState)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAuthors(ormState)).toEqual([
                [{
                    id: 1,
                }]
            ]);
        });
    });

    describe('mapping selector specs', () => {
        it('will throw for non foreign key fields', () => {
            expect(() => orm.Publisher.movies.map(null))
                .toThrow('`map()` requires a selector as an input. Received: null of type object');
            expect(() => orm.Publisher.movies.map(() => null))
                .toThrow('`map()` requires a selector as an input. Received: undefined of type function');
            expect(() => orm.Author.name.map(createSelector(orm, () => {})))
                .toThrow('Cannot map selectors for other fields than foreign key fields');
            const publisherName = createSelector(orm.Publisher.name);
            expect(() => orm.Author.publishers.map(publisherName))
                .toThrow('Cannot map selectors for other fields than foreign key fields');
        });

        it('will map selector outputs for forward foreign key selectors and single instances', () => {
            const movieRating = createSelector(orm.Movie.rating);
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(movieRating)
            );
            expect(publisherMovieRatings(emptyState, 123))
                .toEqual(null); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState, 123)).toEqual([]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState, 123)).toEqual([6, 7]);
        });

        it('will map selector outputs for forward foreign key selectors and some instances', () => {
            const movieRating = createSelector(orm.Movie.rating);
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(movieRating)
            );
            expect(publisherMovieRatings(emptyState, [123]))
                .toEqual([null]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState, [123])).toEqual([
                [],
            ]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState, [123])).toEqual([
                [6, 7],
            ]);
        });

        it('will map selector outputs for forward foreign key selectors and all instances', () => {
            const movieRating = createSelector(orm.Movie.rating);
            const publisherMovieRatings = createSelector(
                orm.Publisher.movies.map(movieRating)
            );
            expect(publisherMovieRatings(emptyState))
                .toEqual([]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherMovieRatings(ormState)).toEqual([
                [],
            ]);
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherMovieRatings(ormState)).toEqual([
                [6, 7],
            ]);
        });

        it('will map selector outputs for backward foreign key selectors and single instance', () => {
            const publisherName = createSelector(orm.Publisher.name);
            const moviePublisherName = createSelector(
                orm.Movie.publisher.map(publisherName)
            );
            expect(moviePublisherName(emptyState, 1))
                .toEqual(null); // movie doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(moviePublisherName(ormState, 1))
                .toEqual(null); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: 'Redux-ORM studios',
                },
            });
            expect(moviePublisherName(ormState, 1)).toEqual('Redux-ORM studios');
        });

        it('will map selector outputs for backward foreign key selectors and some instances', () => {
            const publisherName = createSelector(orm.Publisher.name);
            const moviePublisherName = createSelector(
                orm.Movie.publisher.map(publisherName)
            );
            expect(moviePublisherName(emptyState, [1]))
                .toEqual([null]); // movie doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(moviePublisherName(ormState, [1]))
                .toEqual([null]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: 'Redux-ORM studios',
                },
            });
            expect(moviePublisherName(ormState, [1])).toEqual(['Redux-ORM studios']);
        });

        it('will map selector outputs for backward foreign key selectors and all instances', () => {
            const publisherName = createSelector(orm.Publisher.name);
            const moviePublisherName = createSelector(
                orm.Movie.publisher.map(publisherName)
            );
            expect(moviePublisherName(emptyState))
                .toEqual([]); // movie doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    id: 1,
                    publisherId: 123,
                },
            });
            expect(moviePublisherName(ormState))
                .toEqual([null]); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                    name: 'Redux-ORM studios',
                },
            });
            expect(moviePublisherName(ormState)).toEqual(['Redux-ORM studios']);
        });

        it('can be combined when used as input selectors ', () => {
            const movieRating = createSelector(orm.Movie.rating);
            const publisherAverageRating = createSelector(
                orm.Publisher.movies.map(movieRating),
                ratings => ratings && (ratings.length ? avg(ratings) : 'no movies')
            );
            expect(publisherAverageRating(emptyState, 123))
                .toEqual(null); // publisher doesn't exist yet
            ormState = reducer(ormState, {
                type: CREATE_PUBLISHER,
                payload: {
                    id: 123,
                },
            });
            expect(publisherAverageRating(ormState, 123)).toEqual('no movies');
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 6,
                    publisherId: 123,
                },
            });
            ormState = reducer(ormState, {
                type: CREATE_MOVIE,
                payload: {
                    rating: 7,
                    publisherId: 123,
                },
            });
            expect(publisherAverageRating(ormState, 123)).toEqual(6.5);
        });
    });
});
