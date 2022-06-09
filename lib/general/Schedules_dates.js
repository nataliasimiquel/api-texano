import { Schedules_dates as Schedules_datesModel } from "../models/Schedules_dates";
import { raw, transaction } from 'objection'
import { Availability as AvailabilityModel } from "../models/Availability";
import moment from "moment"
import SchedulesService from "../../services/SchedulesServices";

export const Schedules_dates = (router) => {
  router.get("/all", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await Schedules_datesModel.query()
  });

  router.post('/add-schedules_dates/:availability_id', async (ctx, next) => {
    let params = {...ctx.data, availability_id: ctx.params.availability_id}
    // params = {...ctx.data}
    console.log('params',params)
    const trx = await transaction.start(
        Schedules_datesModel.knex()
    )

    try {console.log('paramssssssssssssssssssssss',params)
      let response = await SchedulesService.createSchedules(params);
      
      // const  availability = await AvailabilityModel.query().findById(params.id_availability)
     /*  if(!availability) throw new Error("Para agendar é preciso selecionar salas e serviços que estejam disponiveis ")
        if(!params.period) throw new Error("Para agendar é preciso colocar um periodo")
        const handleScheduleTime = moment(params.date_time)
        const scheduleTime = {
           weekDay:handleScheduleTime.day(),
          hour:handleScheduleTime.hour(),
          minutes:handleScheduleTime.minutes(),
          endTime: handleScheduleTime.add(params.period,'minutes'),
        }

        const availabilityEndTime = moment(availability.start_time).add(availability.period,'minutes').format('hh:mm')
        console.log(availabilityEndTime );  */
        // throw new Error("para para tudo")


      /* if(availability.weekday!==weekDay) throw new Error("Para agendar é preciso selecionar um dia disponivel ")
      if(availabilityEndTime<scheduleTime.endTime) throw new Error("erro")






      const Schedules_dates = await Schedules_datesModel.query().insertGraphAndFetch({
          period: params.period,
          date_time: params.date_time,
          company_id: availability.company_id,
      }) */
      
      await trx.commit();  
      ctx.body = response
      ctx.status = 200
    } catch (err) {
      ctx.status = 500
      await trx.rollback();
      console.log(err.message)
      throw new Error('Não agendou ', err)

    }
    })
  
    router.patch('/edit-schedules_dates/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(Schedules_datesModel.knex())

      try{
          const editedSchedules_dates = await Schedules_datesModel.query(trx)
          .updateAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedSchedules_dates

      } catch(err){

          await trx.rollback()
          ctx.body = err
      }
  })
  router.delete('/delete-schedules_dates/:id', async (ctx, next) => {
    const trx = await transaction.start(Schedules_datesModel.knex())

    try{
        const deletedSchedules_dates = await Schedules_datesModel.query().findById(ctx.params.id)
        if(!deletedSchedules_dates) throw new Error("Não foi possivel encontrar o id")
        
        await Schedules_datesModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedSchedules_dates

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
};
