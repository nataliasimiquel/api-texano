import { Model } from 'objection';
import Rooms from './Rooms'

export class Availability extends Model {
    static tableName = "availability";
    static relationMappings = {
        rooms: {
            relation: Model.HasOneRelation,
            modelClass: require("./Rooms").Rooms,
            join: {
                from: "rooms.id",
                to: "availability.room_id",
            }
        },
         services_rooms: {
            relation: Model.HasOneRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "services_rooms.id",
                to: "availability.service_room_id",
            }
        },
        services: {
            relation: Model.HasOneRelation,
            modelClass: require("./Services").Services,
            join: {
                from: "services.id",
                to: "availability.service_id",
            }
        },
        companies: {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "availability.company_id",
            }
        },
        schedules_dates: {
            relation: Model.HasOneRelation,
            modelClass: require("./Schedules_dates").Schedules_dates,
            join: {
                from: "availability.id",
                to: "schedules_dates.availability_id",
            }
        },
    
    }
}