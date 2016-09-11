import Schema from '../Schema';
import Model from '../Model';
import { fk, many, oneToOne } from '../fields';

/**
 * These utils create a database schema for testing.
 * The schema is simple but covers most relational
 * cases: foreign keys, one-to-ones, many-to-many's,
 * named reverse relations.
 */

const AUTHORS_INITIAL = [
    {
        name: 'Tommi Kaikkonen',
    },
    {
        name: 'John Doe',
    },
    {
        name: 'Stephen King',
    },
];

const COVERS_INITIAL = [
    {
        src: 'cover.jpg',
    },
    {
        src: 'cover.jpg',
    },
    {
        src: 'cover.jpg',
    },
];

const GENRES_INITIAL = [
    {
        name: 'Biography',
    },
    {
        name: 'Autobiography',
    },
    {
        name: 'Software Development',
    },
    {
        name: 'Redux',
    },
];

const BOOKS_INITIAL = [
    {
        name: 'Tommi Kaikkonen - an Autobiography',
        author: 0,
        cover: 0,
        genres: [0, 1],
        releaseYear: 2050,
        publisher: 1,
    },
    {
        name: 'Clean Code',
        author: 1,
        cover: 1,
        genres: [2],
        releaseYear: 2008,
        publisher: 0,
    },
    {
        name: 'Getting Started with Redux',
        author: 2,
        cover: 2,
        genres: [2, 3],
        releaseYear: 2015,
        publisher: 0,
    },
];

const PUBLISHERS_INITIAL = [
    {
        name: 'Technical Publishing',
    },
    {
        name: 'Autobiographies Inc',
    },
];

export function createTestModels() {
    const Book = class BookModel extends Model {
        static get fields() {
            return {
                author: fk('Author', 'books'),
                cover: oneToOne('Cover'),
                genres: many('Genre', 'books'),
                publisher: fk('Publisher', 'books'),
            };
        }
    };

    Book.modelName = 'Book';

    const Author = class AuthorModel extends Model {
        static get fields() {
            return {
                publishers: many({
                    to: 'Publisher',
                    through: 'Book',
                    relatedName: 'authors',
                }),
            };
        }
    };
    Author.modelName = 'Author';

    const Cover = class CoverModel extends Model {};
    Cover.modelName = 'Cover';

    const Genre = class GenreModel extends Model {};
    Genre.modelName = 'Genre';

    const Publisher = class PublisherModel extends Model {};
    Publisher.modelName = 'Publisher';

    return {
        Book,
        Author,
        Cover,
        Genre,
        Publisher,
    };
}

export function createTestSchema(customModels) {
    const models = customModels || createTestModels();
    const {
        Book,
        Author,
        Cover,
        Genre,
        Publisher,
    } = models;

    const schema = new Schema();
    schema.register(Book, Author, Cover, Genre, Publisher);
    return schema;
}

export function createTestSession() {
    const schema = createTestSchema();
    return schema.from(schema.getDefaultState());
}

export function createTestSessionWithData(customSchema) {
    const schema = customSchema || createTestSchema();
    const state = schema.getDefaultState();
    const mutatingSession = schema.withMutations(state);

    AUTHORS_INITIAL.forEach(props => mutatingSession.Author.create(props));
    COVERS_INITIAL.forEach(props => mutatingSession.Cover.create(props));
    GENRES_INITIAL.forEach(props => mutatingSession.Genre.create(props));
    BOOKS_INITIAL.forEach(props => mutatingSession.Book.create(props));
    PUBLISHERS_INITIAL.forEach(props => mutatingSession.Publisher.create(props));

    const normalSession = schema.from(state);
    return { session: normalSession, schema, state };
}

export const isSubclass = (a, b) => a.prototype instanceof b;
