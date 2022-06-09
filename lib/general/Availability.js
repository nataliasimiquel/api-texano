import { Availability as AvailabilityModel } from "../models/Availability";
import { raw, transaction } from 'objection'
import AvailabilityServices from "../../services/AvailabilityService";

export const Availability = (router) => {
  router.get("/list/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };


    
    if(!params.room_id  && !params.service_id && !params.service_room_id)
     throw new Error("Não foi possivel encontrar o id passado")

    ctx.body = await AvailabilityModel.query()
    .orWhere({"availability.company_id": (ctx.params.user_id ), active: true, 'availability.room_id':  (params.room_id ? params.room_id : 0  )})
    .orWhere({"availability.company_id": (ctx.params.user_id ),active: true, 'availability.service_id':  (params.service_id ? params.service_id : 0)})
    .orWhere({"availability.company_id": (ctx.params.user_id ), active: true,'availability.service_room_id':  (params.service_room_id? params.service_room_id : 0 )})
    .withGraphFetched("rooms") 
    .withGraphFetched("services") 
    .withGraphFetched("services_rooms") 
  });

  // const servicesrooms = await Services_roomsModel.query()
  // .select('id')
  // .withGraphFetched("rooms") 
  // .modifyGraph('rooms', builder => {builder.select('name')})  
  // .withGraphFetched("services") 
  // .modifyGraph('services', builder => {builder.select('name')})  
  // .where( {active: true, company_id:company_id})
  // ctx.body = servicesrooms


  router.get("/list/all/:company_id", async (ctx, next) => {
    ctx.body = await AvailabilityModel.query()
    .where({company_id: ctx.params.company_id,active: true})
    .withGraphFetched("rooms") 
    .withGraphFetched("schedules_dates") 
    .withGraphFetched("services") 
    .withGraphFetched("services_rooms") 
  });

  router.post('/add-availability', async (ctx, next) => {
    let params = {...ctx.data}
    const trx = await transaction.start(
        AvailabilityModel.knex()
    )
    try {
        if(!params.weekday) throw new Error("Para adicionar é preciso colocar um dia da semana")
    //     let existent = await AvailabilityModel.query().findOne(raw("LOWER(weekday)"), params.weekday.toLowerCase())
    //   if(existent) throw new Error("Já existe um serviço com esse dia da semana")



      
      const Availability = await AvailabilityModel.query().insertGraphAndFetch({
          room_id: params.room_id,
          service_id: params.service_id,
          weekday: params.weekday,
          start_time: params.start_time,
          period: params.period,
          service_room_id: params.service_room_id,
          company_id: params.company_id,
      })
      ctx.body = Availability
      ctx.status = 200
  
      await trx.commit()  
    } catch (err) {
      ctx.status = 500
      await trx.rollback();
      console.log(err.message)
      throw new Error('Serviço não adicionado ', err)

    }
    })
  
    router.patch('/edit-availability/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(AvailabilityModel.knex())

      try{
          const editedAvailability = await AvailabilityModel.query(trx)
          .updateAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedAvailability

      } catch(err){

          await trx.rollback()
          ctx.body = err
        //   console.log(err)
      }
  })



  router.patch("/:id/deactivate/:company_id", async (ctx, next) => {
    await AvailabilityServices.deactivateAvailability(ctx, ctx.params.id),
    AvailabilityModel.query().where("company_id", ctx.params.company_id);

    ctx.status = 200;
  });



  router.delete('/delete-availability/:id', async (ctx, next) => {
    const trx = await transaction.start(AvailabilityModel.knex())

    try{
        const deletedAvailability = await AvailabilityModel.query().findById(ctx.params.id)
        if(!deletedAvailability) throw new Error("Não foi possivel encontrar o id")
        
        await AvailabilityModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedAvailability

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
};
