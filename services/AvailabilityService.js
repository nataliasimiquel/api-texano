import { transaction } from "objection";
import { Availability } from "./../lib/models/Availability";

export default class AvailabilityServices {

  

  static async deactivateAvailability(ctx, id) {
    await Availability.query().updateAndFetchById(id, {
      active: false
    })
  }

}