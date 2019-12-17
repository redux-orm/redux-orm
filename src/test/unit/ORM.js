import { ORM, Session, Model, oneToOne, fk, many } from "../..";
import { createTestModels } from "../helpers";
import { STATE_FLAG } from "../../constants";

describe("ORM", () => {
    it("constructor works", () => {
        expect(() => {
            new ORM(); // eslint-disable-line no-new
        }).not.toThrow();
    });

    describe("throws on invalid model declarations", () => {
        it("with multiple one-to-one fields to the same model without related name", () => {
            class A extends Model {}
            A.modelName = "A";

            class B extends Model {}
            B.modelName = "B";
            B.fields = {
                field1: oneToOne("A"),
                field2: oneToOne("A"),
            };
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).toThrow(/field/);
        });

        it("with multiple foreign keys to the same model without related name", () => {
            class A extends Model {}
            A.modelName = "A";

            class B extends Model {}
            B.modelName = "B";
            B.fields = {
                field1: fk("A"),
                field2: fk("A"),
            };
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).toThrow(/field/);
        });

        it("with multiple many-to-manys to the same model without related name", () => {
            class A extends Model {}
            A.modelName = "A";

            class B extends Model {}
            B.modelName = "B";
            B.fields = {
                field1: many("A"),
                field2: many("A"),
            };
            const orm = new ORM();
            orm.register(A, B);
            expect(() => orm.getModelClasses()).toThrow(/field/);
        });

        it("correctly throws an error when a model does not have a modelName property", () => {
            class A extends Model {}
            const orm = new ORM();
            expect(() => orm.register(A)).toThrow(
                "A model was passed that doesn't have a modelName set"
            );
        });
    });

    describe("simple orm", () => {
        let orm;
        let Book;
        let Author;
        let Cover;
        let Genre;
        let Tag;
        let Publisher;
        beforeEach(() => {
            ({
                Book,
                Author,
                Cover,
                Genre,
                Tag,
                Publisher,
            } = createTestModels());

            orm = new ORM();
        });

        it("correctly registers a single model at a time", () => {
            expect(orm.registry).toHaveLength(0);
            orm.register(Book);
            expect(orm.registry).toHaveLength(1);
            orm.register(Author);
            expect(orm.registry).toHaveLength(2);
        });

        it("correctly registers multiple models", () => {
            expect(orm.registry).toHaveLength(0);
            orm.register(Book, Author);
            expect(orm.registry).toHaveLength(2);
        });

        it("correctly starts session", () => {
            const initialState = {};
            const session = orm.session(initialState);
            expect(session).toBeInstanceOf(Session);
        });

        it("correctly gets models from registry", () => {
            orm.register(Book);
            expect(orm.get("Book")).toBe(Book);
        });

        it("throws when trying to get inexistant model from registry", () => {
            expect(() => orm.get("InexistantModel")).toThrow(
                "Did not find model InexistantModel from registry."
            );
        });

        it("correctly sets model prototypes", () => {
            orm.register(Book, Author, Cover, Genre, Tag, Publisher);
            expect(Book.isSetUp).toBeFalsy();

            let coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "cover"
            );
            expect(coverDescriptor).toBeUndefined();
            let authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "author"
            );
            expect(authorDescriptor).toBeUndefined();
            let genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "genres"
            );
            expect(genresDescriptor).toBeUndefined();

            let tagsDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "tags"
            );
            expect(tagsDescriptor).toBeUndefined();

            let publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "publisher"
            );
            expect(publisherDescriptor).toBeUndefined();

            orm._setupModelPrototypes(orm.registry);
            orm._setupModelPrototypes(orm.implicitThroughModels);

            expect(Book.isSetUp).toBeTruthy();

            coverDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "cover"
            );
            expect(typeof coverDescriptor.get).toBe("function");
            expect(typeof coverDescriptor.set).toBe("function");

            authorDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "author"
            );
            expect(typeof authorDescriptor.get).toBe("function");
            expect(typeof authorDescriptor.set).toBe("function");

            genresDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "genres"
            );
            expect(typeof genresDescriptor.get).toBe("function");
            expect(typeof genresDescriptor.set).toBe("function");

            tagsDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "tags"
            );
            expect(typeof tagsDescriptor.get).toBe("function");
            expect(typeof tagsDescriptor.set).toBe("function");

            publisherDescriptor = Object.getOwnPropertyDescriptor(
                Book.prototype,
                "publisher"
            );
            expect(typeof publisherDescriptor.get).toBe("function");
            expect(typeof publisherDescriptor.set).toBe("function");
        });

        it("correctly gets the default state", () => {
            orm.register(Book, Author, Cover, Genre, Tag, Publisher);
            const defaultState = orm.getEmptyState();

            expect(defaultState).toEqual({
                [STATE_FLAG]: true,
                Book: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {
                        author: {},
                        publisher: {},
                    },
                },
                BookGenres: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {
                        fromBookId: {},
                        toGenreId: {},
                    },
                },
                BookTags: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {
                        fromBookId: {},
                        toTagId: {},
                    },
                },
                Author: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {},
                },
                Cover: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {},
                },
                Genre: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {},
                },
                Tag: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {},
                },
                TagSubTags: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {
                        fromTagId: {},
                        toTagId: {},
                    },
                },
                Publisher: {
                    items: [],
                    itemsById: {},
                    meta: {},
                    indexes: {},
                },
            });
        });

        it("immutably adapts schema spec to new model fields", () => {
            orm.register(Book, Author, Cover, Genre, Tag, Publisher);
            const coverFields = orm.generateSchemaSpec().tables.Cover.fields;
            Cover.fields.tag = fk("Tag", "covers");
            expect(orm.generateSchemaSpec().tables.Cover.fields).not.toEqual(
                coverFields
            );
        });

        it("correctly starts a mutating session", () => {
            orm.register(Book, Author, Cover, Genre, Tag, Publisher);
            const initialState = orm.getEmptyState();
            const session = orm.mutableSession(initialState);
            expect(session).toBeInstanceOf(Session);
            expect(session.withMutations).toBe(true);
        });

        it("throws if reserved Table options are specified", () => {
            class CustomizedModel extends Model {}
            CustomizedModel.modelName = "CustomizedModel";
            CustomizedModel.options = {
                indexes: {},
            };
            orm.register(CustomizedModel);
            expect(() => {
                orm.session();
            }).toThrow(
                "Reserved keyword `indexes` used in CustomizedModel.options."
            );
            CustomizedModel.options = {
                meta: {},
            };
            expect(() => {
                orm.session();
            }).toThrow(
                "Reserved keyword `meta` used in CustomizedModel.options."
            );
        });
    });
});
