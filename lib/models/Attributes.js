import { Model } from "objection"

export class Attributes extends Model {
    static tableName = "attributes";
    static relationMappings = {
        content_attribute: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentAttributes").ContentAttributes,
            join: {
                from: "attributes.content_attributes_id",
                to: "content_attributes.id",
            }
        },
    }
}