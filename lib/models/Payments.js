import { Model } from "objection"

export class Payments extends Model {
    static tableName = "payments";
    static relationMappings = {
        method: {
            relation: Model.HasOneRelation,
            modelClass: require("./Methods").Methods,
            join: {
                from: "payments.method_id",
                to: "methods.id",
            }
        },
    }
}