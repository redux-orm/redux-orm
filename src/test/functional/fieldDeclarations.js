/* eslint-disable no-shadow */
import { Model, ORM } from "../../index";
import ReferencedModel from "../ReferencedModel";
import ReferencingModel from "../ReferencingModel";
import ThroughModel from "../ThroughModel";

describe("Field declarations", () => {
    describe("Common mistakes", () => {
        it("fields need to be instances of the Field class", () => {
            class MyModel extends Model {}
            MyModel.modelName = "MyModel";
            MyModel.fields = {
                test: "myTestField",
            };

            const orm = new ORM();
            orm.register(MyModel);
            expect(() => orm.session()).toThrow(
                'MyModel.test is of type "string" but must be an instance of Field. Please use the `attr`, `fk`, `oneToOne` and `many` functions to define fields.'
            );
        });
    });

    describe("specifying relations using Model classes works", () => {
        const orm = new ORM();
        orm.register(ReferencedModel, ReferencingModel, ThroughModel);
        let session;

        beforeEach(() => {
            session = orm.session();
        });

        it("correctly handles Model class provided to descriptor function as first argument", () => {
            const { ReferencedModel, ReferencingModel } = session;

            ReferencedModel.create({ id: 1 });
            ReferencingModel.create({ id: 1, oneToOneField: 1 });

            expect(ReferencedModel.withId(1).reverseOneToOneField.ref).toEqual({
                id: 1,
                oneToOneField: 1,
            });
            expect(ReferencingModel.withId(1).oneToOneField.ref).toEqual({
                id: 1,
            });
        });

        it("correctly handles Model class provided to descriptor function within the opts object", () => {
            const { ReferencedModel, ReferencingModel } = session;

            ReferencedModel.create({ id: 1 });
            ReferencingModel.create({ id: 1, fkField: 1 });
            ReferencingModel.create({ id: 2, fkField: 1 });

            expect(ReferencedModel.withId(1).reverseFkField.count()).toEqual(2);
        });

        it("correctly handles Model class provided as an explicit through model", () => {
            const { ReferencedModel, ReferencingModel, ThroughModel } = session;

            ReferencedModel.create({ id: 1 });
            ReferencedModel.create({ id: 2 });
            ReferencingModel.create({ id: 1, manyField: [1, 2] });
            ReferencingModel.create({ id: 2, manyField: [1, 2] });

            expect(ThroughModel.count()).toEqual(4);
            expect(ReferencedModel.withId(1).reverseManyField.count()).toEqual(
                2
            );
        });
    });
});
