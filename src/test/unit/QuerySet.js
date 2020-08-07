import { Model, ORM, QuerySet } from "../..";
import { createTestModels, createTestSessionWithData } from "../helpers";

describe("QuerySet tests", () => {
    let session;
    let bookQs;
    let genreQs;
    let tagQs;
    beforeEach(() => {
        ({ session } = createTestSessionWithData());
        bookQs = session.Book.getQuerySet();
        genreQs = session.Genre.getQuerySet();
        tagQs = session.Tag.getQuerySet();
    });

    it("count works correctly", () => {
        expect(bookQs.count()).toBe(3);
        expect(genreQs.count()).toBe(4);
        expect(tagQs.count()).toBe(4);
    });

    it("exists works correctly", () => {
        expect(bookQs.exists()).toBe(true);

        const emptyQs = new QuerySet(session.Book, []).filter(() => false);

        expect(emptyQs.exists()).toBe(false);
    });

    it("at works correctly", () => {
        expect(bookQs.at(0)).toBeInstanceOf(Model);
        expect(bookQs.toRefArray()[0]).toBe(session.Book.withId(0).ref);
    });

    it("at doesn't return a Model instance if index is out of bounds", () => {
        expect(bookQs.at(-1)).toBeUndefined();
        const len = bookQs.count();
        expect(bookQs.at(len)).toBeUndefined();
    });

    it("first works correctly", () => {
        expect(bookQs.first()).toEqual(bookQs.at(0));
    });

    it("last works correctly", () => {
        const lastIndex = bookQs.count() - 1;
        expect(bookQs.last()).toEqual(bookQs.at(lastIndex));
    });

    it("all works correctly", () => {
        const all = bookQs.all();

        // Force evaluation of QuerySets
        bookQs.toRefArray();
        all.toRefArray();

        expect(all).not.toBe(bookQs);
        expect(all.rows).toHaveLength(bookQs.rows.length);

        for (let i = 0; i < all.rows.length; i++) {
            expect(all.rows[i]).toBe(bookQs.rows[i]);
        }
    });

    it("filter works correctly with object argument", () => {
        const filtered = bookQs.filter({ name: "Clean Code" });
        expect(filtered.count()).toBe(1);
        expect(filtered.first().ref).toBe(session.Book.withId(1).ref);
    });

    it("filter works correctly with object argument, with model instance value", () => {
        const filtered = bookQs.filter({
            author: session.Author.withId(0),
        });
        expect(filtered.count()).toBe(1);
        expect(filtered.first().ref).toBe(session.Book.withId(0).ref);
    });

    it("orderBy works correctly with prop argument", () => {
        const ordered = bookQs.orderBy(["releaseYear"]);
        const idArr = ordered.toRefArray().map((row) => row.id);
        expect(idArr).toEqual([1, 2, 0]);
    });

    it("orderBy works correctly with function argument", () => {
        const ordered = bookQs.orderBy([(book) => book.releaseYear]);
        const idArr = ordered.toRefArray().map((row) => row.id);
        expect(idArr).toEqual([1, 2, 0]);
    });

    it("exclude works correctly with object argument", () => {
        const excluded = bookQs.exclude({ name: "Clean Code" });
        expect(excluded.count()).toBe(2);

        const idArr = excluded.toRefArray().map((row) => row.id);
        expect(idArr).toEqual([0, 2]);
    });

    it("exclude works correctly with object argument, with model instance value", () => {
        const excluded = bookQs.exclude({
            author: session.Author.withId(1),
        });
        expect(excluded.count()).toBe(2);

        const idArr = excluded.toRefArray().map((row) => row.id);
        expect(idArr).toEqual([0, 2]);
    });

    it("exclude works correctly with function argument", () => {
        const excluded = bookQs.exclude(({ author }) => author === 1);
        expect(excluded.count()).toBe(2);

        const idArr = excluded.toRefArray().map((row) => row.id);
        expect(idArr).toEqual([0, 2]);
    });

    it("update records a update", () => {
        const mergeObj = { name: "Updated Book Name" };
        bookQs.update(mergeObj);

        bookQs
            .toRefArray()
            .forEach((row) => expect(row.name).toBe("Updated Book Name"));
    });

    it("delete records a update", () => {
        bookQs.delete();
        expect(bookQs.count()).toBe(0);
    });

    it("toString returns evaluated models", () => {
        const firstTwoBooks = bookQs.filter(({ id }) => [0, 1].includes(id));
        expect(firstTwoBooks.toString()).toBe(`QuerySet contents:
    - Book: {id: 0, name: Tommi Kaikkonen - an Autobiography, releaseYear: 2050, author: 0, cover: 0, genres: [0, 1], tags: [Technology, Literary], publisher: 1}
    - Book: {id: 1, name: Clean Code, releaseYear: 2008, author: 1, cover: 1, genres: [2], tags: [Technology], publisher: 0}`);
    });

    it("custom methods works", () => {
        const {
            Book,
            Genre,
            Tag,
            Cover,
            Author,
            Publisher,
            Movie,
        } = createTestModels();

        const currentYear = 2015;
        class CustomQuerySet extends QuerySet {
            unreleased() {
                return this.filter((book) => book.releaseYear > currentYear);
            }
        }
        CustomQuerySet.addSharedMethod("unreleased");

        Book.querySetClass = CustomQuerySet;

        const orm = new ORM();
        orm.register(Book, Genre, Tag, Cover, Author, Publisher, Movie);
        const { session: sess } = createTestSessionWithData(orm);

        const customQs = sess.Book.getQuerySet();

        expect(customQs).toBeInstanceOf(CustomQuerySet);

        const unreleased = customQs.unreleased();
        expect(unreleased.count()).toBe(1);

        expect(unreleased.first().ref).toEqual({
            id: 0,
            name: "Tommi Kaikkonen - an Autobiography",
            author: 0,
            cover: 0,
            releaseYear: 2050,
            publisher: 1,
        });
        expect(sess.Book.unreleased().count()).toBe(1);
        expect(sess.Book.filter({ name: "Clean Code" }).count()).toBe(1);
    });

    it("should throw a custom error when user try to interact with database without a session", () => {
        const { Book } = createTestModels();
        const errorMessage =
            'Tried to query the Book model\'s table without a session. Create a session using `session = orm.session()` and use `session["Book"]` for querying instead.';
        expect(() => Book.getQuerySet().count()).toThrow(errorMessage);
        expect(() => Book.getQuerySet().exists()).toThrow(errorMessage);
        expect(() => Book.getQuerySet().at(0)).toThrow(errorMessage);
        expect(() => Book.getQuerySet().first()).toThrow(errorMessage);
        expect(() => Book.getQuerySet().last()).toThrow(errorMessage);
    });
});
