import { Model } from "objection"

export class Stock extends Model {
    static tableName = "stock";
    static relationMappings = {
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "stock.product_id",
                to: "products.id",
            }
        },
        sales: {
            relation: Model.ManyToManyRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "stock.id",
                through: {
                    from: "sales.stock_id",
                    to: "sales.stock_id",
                }
            }
        },
    }
}