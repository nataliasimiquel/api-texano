import { Model } from 'objection';
import Services from './Services'

export class Customer extends Model {
    static tableName = "customer";
    static relationMappings = {
      
         schedules: {
            relation: Model.HasOneRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "customer.id",
                to: "schedules.client_id",
            }
        },
        companies : {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "customer.company_id",
            }
        },
    }
}