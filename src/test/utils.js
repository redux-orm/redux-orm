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
    },
    {
        name: 'Clean Code',
        author: 1,
        cover: 1,
        genres: [2],
        releaseYear: 2008,
    },
    {
        name: 'Getting Started with Redux',
        author: 2,
        cover: 2,
        genres: [2, 3],
        releaseYear: 2015,
    },
];


export function createTestModels() {
    const Book = class BookModel extends Model {
        static get fields() {
            return {
                author: fk('Author', 'books'),
                cover: oneToOne('Cover'),
                genres: many('Genre', 'books'),
            };
        }
    };

    Book.modelName = 'Book';

    const Author = class AuthorModel extends Model {};
    Author.modelName = 'Author';

    const Cover = class CoverModel extends Model {};
    Cover.modelName = 'Cover';

    const Genre = class GenreModel extends Model {};
    Genre.modelName = 'Genre';

    return {
        Book,
        Author,
        Cover,
        Genre,
    };
}

export function createTestSchema(customModels) {
    const models = customModels || createTestModels();
    const {
        Book,
        Author,
        Cover,
        Genre,
    } = models;

    const schema = new Schema();
    schema.register(Book, Author, Cover, Genre);
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

    const normalSession = schema.from(state);
    return { session: normalSession, schema, state };
}

export const isSubclass = (a, b) => a.prototype instanceof b;
