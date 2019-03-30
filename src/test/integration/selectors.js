import {
    ORM, Session, createSelector
} from '../..';
import { createTestModels, avg } from '../helpers';

describe('Selector memoization', () => {
    let orm;
    let reducer;
    let emptyState;
    let nextState;
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
        orm = new ORM({
            stateSelector: (state) => state.orm,
        });
        orm.register(Book, Cover, Genre, Tag, Author, Movie, Publisher);
        reducer = (state, action) => {
            const session = orm.session(state || orm.getEmptyState());
            switch (action.type) {
            case CREATE_MOVIE:
                session.MOVIE.create(action.payload);
                break;
            case CREATE_PUBLISHER:
                session.PUBLISHER.create(action.payload);
                break;
            }
            return session.state;
        };
        nextState = emptyState = orm.getEmptyState();
    });

    it('passes on input args', () => {
        const ormState = state => state.orm;
        /**
         * The way we have to do it right now.
         */
const old = createSelector(
    orm,
    ormState,
    (state, id) => id,
    ({ Publisher }, id) => (
        avg(Publisher.withId(id).movies.map(movie => movie.rating))
    ),
);
        /**
         * This is the desired new functionality.
         */
        const publisherRatingAvg = createSelector(
            orm,
            Publisher.movies,
            (_, movies) => avg(movies.map(movie => movie.rating))
        );
        expect(() => publisherRatingAvg(emptyState, 0))
            .toThrow('Publisher with id 0 doesn\'t exist');
        nextState = reducer(nextState, {
            type: CREATE_PUBLISHER,
            payload: {
                id: 123,
            },
        });
        expect(publisherRatingAvg(nextState, 123)).toEqual(null);
        nextState = reducer(nextState, {
            type: CREATE_MOVIE,
            payload: {
                rating: 6,
                publisher: 123,
            },
        });
        nextState = reducer(nextState, {
            type: CREATE_MOVIE,
            payload: {
                rating: 7,
                publisher: 123,
            },
        });
        expect(publisherRatingAvg(nextState, 123)).toEqual(6.5);
    });

//     it('orm.memo() works with a passed state selector', () => {

//         const book = orm.memo(Book.withId);
//         expect(book(emptyState, 1)).toBe(null);
//         const nextState = reducer(emptyState, {
//             id: 1,
//             title: 'First book',
//         });
//         expect(book(nextState, 1).ref).toBe(
//             orm.session(nextState).Book.withId(1).ref
//         );
//     });

});
