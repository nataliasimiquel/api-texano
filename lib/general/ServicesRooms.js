import { Services_rooms as Services_roomsModel } from "../models/Services_rooms";
import { raw, transaction } from 'objection'
import ServicesService from "../../services/ServicesService";

export const ServicesRooms = (router) => {
  router.get("/list/:company_id", async (ctx, next) => {
    let params = { ...ctx.data };

    const company_id = ctx.params.company_id


   const servicesrooms = await Services_roomsModel.query()
   .select('id')
   .withGraphFetched("rooms") 
   .modifyGraph('rooms', builder => {builder.select('name')})  
   .withGraphFetched("services") 
   .modifyGraph('services', builder => {builder.select('name')})  
   .where( {active: true, company_id:company_id})
   ctx.body = servicesrooms
  });



  // router.get("/list/:company_id", async (ctx, next) => {
  //   ctx.body = await Services_roomsModel.query().where({
  //     company_id: ctx.params.company_id,
  //   });
  // });

  router.post('/add-servicesrooms/:company_id', async (ctx, next) => {
    let params = {...ctx.params}
    let data = {...ctx.data}
    const trx = await transaction.start(
        Services_roomsModel.knex()
        )
    try {
      
      const servicesrooms = await Services_roomsModel.query().insertGraphAndFetch({
          room_id: data.room_id,
          service_id: data.service_id,
          company_id: params.company_id,
      })
      ctx.body = servicesrooms
      ctx.status = 200
  
      await trx.commit()  
    } catch (err) {
      ctx.status = 500
      await trx.rollback();
      throw new Error('Serviço não adicionado ', err)

    }
    })
  
    router.patch('/edit-servicesrooms/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(Services_roomsModel.knex())

      try{
          const editedServices = await Services_roomsModel.query(trx)
          .updateAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedServices

      } catch(err){

          await trx.rollback()
          ctx.body = err
      }
  })


  router.patch("/:id/deactivate/:company_id", async (ctx, next) => {
    await ServicesService.deactivateServicesRooms(ctx, ctx.params.id),
    Services_roomsModel.query().where("company_id", ctx.params.company_id);

    ctx.status = 200;
  });


  router.delete('/delete-servicesrooms/:id', async (ctx, next) => {
    const trx = await transaction.start(Services_roomsModel.knex())

    try{
        const deletedServicesRooms = await Services_roomsModel.query().findById(ctx.params.id)
        if(!deletedServicesRooms) throw new Error("Não foi possivel encontrar o id")
        
        await Services_roomsModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedServicesRooms

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
};
