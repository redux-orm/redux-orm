import { fk, many, Model, oneToOne } from "../index";
import ReferencedModel from "./ReferencedModel";
// eslint-disable-next-line import/no-cycle
import ThroughModel from "./ThroughModel";

export default class ReferencingModel extends Model {
    static get modelName() {
        return "ReferencingModel";
    }

    static get fields() {
        return {
            fkField: fk({
                to: ReferencedModel,
                relatedName: "reverseFkField",
            }),
            oneToOneField: oneToOne(ReferencedModel, "reverseOneToOneField"),
            manyField: many({
                to: ReferencedModel,
                relatedName: "reverseManyField",
                through: ThroughModel,
                throughFields: ["referencingModel", "referencedModel"],
            }),
        };
    }
}
