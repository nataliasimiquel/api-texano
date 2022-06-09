import { Model } from "objection"
import { Payments } from '../models/Payments';

export class Methods extends Model {
    static tableName = "methods";
    static relationMappings = {
        payment: {
            relation: Model.HasManyRelation,
            modelClass: require("./Payments").Payments,
            join: {
                from: "methods.id",
                to: "payments.method_id",
            }
        },
    }
}