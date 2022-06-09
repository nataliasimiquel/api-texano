import { Model } from "objection"
import { Stock } from '../models/Stock';

export class Sales extends Model {
    static tableName = "sales";
    static relationMappings = {
        stock: {
            relation: Model.HasOneRelation,
            modelClass: require("./Stock").Stock,
            join: {
                from: "sales.stock_id",
                to: "stock.id"

            }
        },
    }
}