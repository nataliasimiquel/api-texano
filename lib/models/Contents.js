import { Model } from "objection"
import { Stock } from '../models/Stock';

export class Contents extends Model {
    static tableName = "contents";
    static relationMappings = {
    }
}