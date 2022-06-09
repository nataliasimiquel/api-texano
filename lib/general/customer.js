import { Customer as CustomerModel } from "../models/Customer";
import { raw, transaction } from 'objection'

export const Customer = (router) => {
  router.get("/all/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await CustomerModel.query().where("company_id", ctx.params.user_id);

  });

  router.get("/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };
    if(!params.customer_id) throw new Error("insira um id de cliente existente")
    
    ctx.body = await CustomerModel.query().where("company_id", ctx.params.user_id).findById(params.customer_id);

  });

  router.post('/add-customer', async (ctx, next) => {
    let params = {...ctx.data}
    const trx = await transaction.start(
        CustomerModel.knex()
    )
    try {
        let params = {...ctx.data}
        if(!params.name) throw new Error("Para registarmos um cliente precisamos do seu nome")
        if(!params.cpf) throw new Error("Para registarmos um cliente precisamos de um cpf")
        if(!params.email) throw new Error("Para registarmos um cliente precisamos de um email")
        if(!params.phone) throw new Error("Para registarmos um cliente precisamos de um telefone")

        params.cpf = params.cpf.replace(/ |\.|\-|\_/g, "")

        let existent = await CustomerModel.query().findOne(raw("LOWER(email)"), params.email.toLowerCase())
        if(existent) throw new Error("Já existe um cliente com esse email")
        existent = await CustomerModel.query().findOne("cpf", params.cpf)
        if(existent) throw new Error("Já existe um cliente com esse cpf")


      
      const Customer = await CustomerModel.query().insertGraphAndFetch({
          name: params.name,
          cpf: params.cpf,
          email: params.email,
          phone: params.phone,
          company_id: params.company_id,
      })
      ctx.body = Customer
      ctx.status = 200
  
      await trx.commit()  
    } catch (err) {
      ctx.status = 500
      await trx.rollback();
      console.log(err.message)
      throw new Error('Serviço não adicionado ', err)

    }
    })
  
    router.patch('/edit-customer/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(CustomerModel.knex())

      try{
          const editedCustomer = await CustomerModel.query(trx)
          .updateAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedCustomer

      } catch(err){

          await trx.rollback()
          ctx.body = err
        //   console.log(err)
      }
  })
  router.delete('/delete-customer/:id', async (ctx, next) => {
    const trx = await transaction.start(CustomerModel.knex())

    try{
        const deletedCustomer = await CustomerModel.query().findById(ctx.params.id)
        if(!deletedCustomer) throw new Error("Não foi possivel encontrar o id")
        
        await CustomerModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedCustomer

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
};
