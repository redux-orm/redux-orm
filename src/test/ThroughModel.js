import { fk, Model } from "../index";
import ReferencedModel from "./ReferencedModel";
// eslint-disable-next-line import/no-cycle
import ReferencingModel from "./ReferencingModel";

export default class ThroughModel extends Model {
    static get modelName() {
        return "ThroughModel";
    }

    static get fields() {
        return {
            referencedModel: fk(ReferencedModel),
            referencingModel: fk(ReferencingModel),
        };
    }
}
