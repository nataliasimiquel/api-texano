import { Model } from "objection"
import { Stock } from '../models/Stock';

export class ContentsTypes extends Model {
    static tableName = "contents_types";
    static relationMappings = {
        content_attribute: {
            relation: Model.HasManyRelation,
            modelClass: require("./ContentAttributes").ContentAttributes,
            join: {
                from: "contents_types.id",
                to: "content_attributes.contents_types_id",
            }
        },
    }
}