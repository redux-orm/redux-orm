import Schema from '../Schema';
import Model from '../Model';
import {ForeignKey, ManyToMany, OneToOne} from '../fields';

/**
 * These utils create a database schema for testing.
 * The schema is simple but covers most relational
 * cases: foreign keys, one-to-ones, many-to-many's,
 * named reverse relations.
 */


export function createTestModels() {
    const Book = class BookModel extends Model {
        static get fields() {
            return {
                author: new ForeignKey('Author', 'books'),
                cover: new OneToOne('Cover'),
                genres: new ManyToMany('Genre', 'books'),
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

export function createTestSchema() {
    const {
        Book,
        Author,
        Cover,
        Genre,
    } = createTestModels();

    const schema = new Schema();
    schema.register(Book, Author, Cover, Genre);
    return schema;
}

export function createTestSession() {
    const schema = createTestSchema();
    return schema.from(schema.getDefaultState());
}
