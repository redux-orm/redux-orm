import ORM from "../ORM";
import Model from "../Model";
import { fk, many, oneToOne, attr } from "../fields";

/**
 * These utils create a database schema for testing.
 * The schema is simple but covers most relational
 * cases: foreign keys, one-to-ones, many-to-many's,
 * named reverse relations.
 */

const AUTHORS_INITIAL = [
    {
        name: "Tommi Kaikkonen",
    },
    {
        name: "John Doe",
    },
    {
        name: "Stephen King",
    },
];

const COVERS_INITIAL = [
    {
        src: "cover.jpg",
    },
    {
        src: "cover.jpg",
    },
    {
        src: "cover.jpg",
    },
];

const GENRES_INITIAL = [
    {
        name: "Biography",
    },
    {
        name: "Autobiography",
    },
    {
        name: "Software Development",
    },
    {
        name: "Redux",
    },
];

const TAGS_INITIAL = [
    {
        name: "Technology",
    },
    {
        name: "Literary",
    },
    {
        name: "Natural",
    },
    {
        name: "Redux",
    },
];

const BOOKS_INITIAL = [
    {
        name: "Tommi Kaikkonen - an Autobiography",
        author: 0,
        cover: 0,
        genres: [0, 1],
        tags: ["Technology", "Literary"],
        releaseYear: 2050,
        publisher: 1,
    },
    {
        name: "Clean Code",
        author: 1,
        cover: 1,
        genres: [2],
        tags: ["Technology"],
        releaseYear: 2008,
        publisher: 0,
    },
    {
        name: "Getting Started with Redux",
        author: 2,
        cover: 2,
        genres: [2, 3],
        tags: ["Technology", "Redux"],
        releaseYear: 2015,
        publisher: 0,
    },
];

const PUBLISHERS_INITIAL = [
    {
        name: "Technical Publishing",
    },
    {
        name: "Autobiographies Inc",
    },
    {
        name: "Paramount Pictures",
    },
];

const MOVIES_INITIAL = [
    {
        name: "The Godfather",
        characters: ["Vito Corleone", "Tom Hagen", "Bonasera"],
        hasPremiered: true,
        rating: 9.2,
        meta: {},
        publisherId: 2,
    },
];

export function createTestModels() {
    const Book = class BookModel extends Model {
        static get fields() {
            return {
                id: attr(),
                name: attr(),
                releaseYear: attr(),
                author: fk("Author", "books"),
                cover: oneToOne("Cover"),
                genres: many("Genre", "books"),
                tags: many("Tag", "books"),
                publisher: fk("Publisher", "books"),
            };
        }
    };
    Book.modelName = "Book";

    const Author = class AuthorModel extends Model {
        static get fields() {
            return {
                id: attr(),
                name: attr(),
                publishers: many({
                    to: "Publisher",
                    through: "Book",
                    relatedName: "authors",
                }),
            };
        }
    };
    Author.modelName = "Author";

    const Cover = class CoverModel extends Model {};
    Cover.modelName = "Cover";
    Cover.fields = {
        id: attr(),
        src: attr(),
    };

    const Genre = class GenreModel extends Model {};
    Genre.modelName = "Genre";
    Genre.fields = {
        id: attr(),
        name: attr(),
    };

    const Tag = class TagModel extends Model {};
    Tag.modelName = "Tag";
    Tag.options = {
        idAttribute: "name",
    };
    Tag.fields = {
        name: attr(),
        subTags: many("this", "parentTags"),
        // TODO: bidirectional many-to-many relations
        // synonymousTags: many('Tag', 'synonymousTags'),
    };

    const Publisher = class PublisherModel extends Model {
        aModelMethod() {
            return `Name: ${this.name}`;
        }
    };
    Publisher.modelName = "Publisher";
    Publisher.fields = {
        id: attr(),
        name: attr(),
    };

    const Movie = class MovieModel extends Model {};
    Movie.modelName = "Movie";
    Movie.fields = {
        id: attr(),
        name: attr(),
        rating: attr(),
        hasPremiered: attr(),
        characters: attr(),
        meta: attr(),
        publisherId: fk({
            to: "Publisher",
            as: "publisher",
            relatedName: "movies",
        }),
    };

    return {
        Book,
        Author,
        Cover,
        Genre,
        Tag,
        Publisher,
        Movie,
    };
}

export function createTestORM(customModels) {
    const models = customModels || createTestModels();
    const { Book, Author, Cover, Genre, Tag, Publisher, Movie } = models;

    const orm = new ORM();
    orm.register(Book, Author, Cover, Genre, Tag, Publisher, Movie);
    return orm;
}

export function createTestSession() {
    const orm = createTestORM();
    return orm.session(orm.getEmptyState());
}

export function createTestSessionWithData(customORM) {
    const orm = customORM || createTestORM();
    const state = orm.getEmptyState();
    const {
        Author,
        Cover,
        Genre,
        Tag,
        Book,
        Publisher,
        Movie,
    } = orm.mutableSession(state);

    AUTHORS_INITIAL.forEach((props) => Author.create(props));
    COVERS_INITIAL.forEach((props) => Cover.create(props));
    GENRES_INITIAL.forEach((props) => Genre.create(props));
    TAGS_INITIAL.forEach((props) => Tag.create(props));
    BOOKS_INITIAL.forEach((props) => Book.create(props));
    PUBLISHERS_INITIAL.forEach((props) => Publisher.create(props));
    MOVIES_INITIAL.forEach((props) => Movie.create(props));

    const normalSession = orm.session(state);
    return { session: normalSession, orm, state };
}

export const isSubclass = (a, b) => a.prototype instanceof b;

export const measureMsSince = (startTime) => {
    if (!startTime) {
        return process.hrtime();
    }
    const endTime = process.hrtime(startTime);
    return Math.round(endTime[0] * 1000 + endTime[1] / 1000000);
};

export const nTimes = (n) => Array.from({ length: n });

export function measureMs(fn) {
    const start = measureMsSince();
    fn(...arguments);
    return measureMsSince(start);
}

export const avg = (arr) => {
    if (arr.length === 0) return null;
    const sum = arr.reduce((cur, summand) => cur + summand);
    return sum / arr.length;
};

export const round = (num, precision, base = 10) => {
    const precisionFactor = base ** precision;
    return Math.round(num * precisionFactor) / precisionFactor;
};
