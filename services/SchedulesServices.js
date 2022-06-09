import { Schedules_dates } from "../lib/models/Schedules_dates";
import moment from "moment";
import { transaction } from "objection";
import { Availability } from "../lib/models/Availability";

  const validateHour=(StartTime, Period, reservedInitialTime, reservedperiod)=> {
    const finalTime = moment(StartTime).add(Period, "minutes");
    const startTime = moment(StartTime);
    const reservedStartTime = moment(reservedInitialTime);
    const reservedFinalTime = moment(reservedInitialTime).add(
      reservedperiod,
      "minutes"
    );

    if (
      (reservedStartTime.isAfter(finalTime) ||
      reservedStartTime.isSame(finalTime))

    ) {
        console.log("em cima");
      return false;
    } else if (
     
      (reservedFinalTime.isBefore(startTime) ||
      reservedFinalTime.isSame(startTime))


    ) {
        console.log("em baixo");
      return false;
    } 
    console.log("fora");
    return true;
  }

  const validateAvailability=(StartTime, Period, reservedInitialTime, reservedperiod)=> {
    const finalTimeHour = moment(StartTime).add(Period, "minutes").format('HH:mm');
    const startTimeHour = moment(StartTime).format('HH:mm');
    const reservedStartTimeHour = moment(reservedInitialTime).format('HH:mm');
    const reservedFinalTimeHour = moment(reservedInitialTime).add(
      reservedperiod,
      "minutes"
    ).format('HH:mm');
    const finalTime = moment(finalTimeHour,'HH:mm')
    const startTime = moment(startTimeHour,'HH:mm')
    const reservedStartTime = moment(reservedStartTimeHour,'HH:mm')
    const reservedFinalTime = moment(reservedFinalTimeHour,'HH:mm')

    if (
      (finalTime.isBefore(reservedFinalTime) &&
        finalTime.isBefore(reservedStartTime)) ||
      (startTime.isBefore(reservedFinalTime) &&
        startTime.isBefore(reservedStartTime))
    ) {
      return true;
    } else if (
      (finalTime.isAfter(reservedFinalTime) &&
        finalTime.isAfter(reservedStartTime)) ||
      (startTime.isAfter(reservedFinalTime) &&
        startTime.isAfter(reservedStartTime))
    ) {

      return true;
    } else if (
      (finalTime.isAfter(reservedFinalTime) &&
        startTime.isSame(reservedFinalTime)) ||
      (finalTime.isSame(reservedStartTime) &&
        startTime.isBefore(reservedStartTime))
    ) {

      return true;
    }

    return false;
  }

 const createSchedules=async(params)=> {
    const trx = await transaction.start(Schedules_dates.knex());
    try {
      const reservedDates = await Schedules_dates.query().where(
        "date",
        params.date
      );

      let missMatch = false;
      console.log(reservedDates);
      if (reservedDates) {
        reservedDates.map((reservedDate) => {
            (validateHour(
            params.date_time,
            params.period,
            reservedDate.date_time,
            reservedDate.period
          ))
            ? (missMatch = true)
            : "";
          });
        }

        if (missMatch) throw new Error("Insira uma periodo válido"); 

        const availability = await Availability.query().findById(
          params.availability_id
        );

        let weekday = moment(params.date_time).day();
        
        console.log('availability', params)
        
        if (weekday !== availability.weekday)

          throw new Error("Selecione uma data disponivel"); 
        missMatch = false;

        validateAvailability(
          params.date_time,
          params.period,
          availability.start_time,
          availability.period
        )
          ? (missMatch = true)
          : "";

        if (missMatch) throw new Error("Insira uma periodo válido2");
        let response = await Schedules_dates.query(trx).insertGraphAndFetch({
          period: params.period,
          company_id: availability.company_id,
          date: params.date,
          date_time: params.date_time,
          availability_id:availability.id,
          schedules: [
            {
              room_id: availability.room_id,
              service_id: availability.service_id,
              service_room_id: availability.service_room_id,
              client_id: params.client_id,
              company_id: params.company_id,
              type: params.client_id ? "reserved" : "unavailable",
            },
          ],
        });
        console.log('-------------------->',response);
        await trx.commit();
        return response;

    } catch (err) {
        console.log("erro")
      await trx.rollback();
      return err.message;
    }
  }

  export default {createSchedules,validateHour}
