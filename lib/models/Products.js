import { Model } from "objection"

export class Products extends Model {
    static tableName = "products";
    static relationMappings = {
        categories: {
            relation: Model.ManyToManyRelation,
            modelClass: require("./Categories").Categories,
            join: {
                from: "products.category_id",
                through: {
                    from: "categories.id",
                    to: "categories.id",
                }
            }
        },
        stock: {
            relation: Model.HasManyRelation,
            modelClass: require("./Stock").Stock,
            join: {
                from: "products.id",
                to: "stock.product_id",
            }
        },
        product_category: {
            relation: Model.HasManyRelation,
            modelClass: require("./ProductCategory").ProductCategory,
            join: {
                from: "products.id",
                to: "product_category.product_id"
            }
        }   
    }
}