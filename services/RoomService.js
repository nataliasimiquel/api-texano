import { transaction } from "objection";
import { Rooms } from "./../lib/models/Rooms";

export default class RoomsServices {

  

  static async deactivateRoom(ctx, id) {
    await Rooms.query().updateAndFetchById(id, {
      active: false
    })
  }

}