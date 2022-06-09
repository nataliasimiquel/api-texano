import moment from 'moment'
import { Payments as PaymentsModel} from '../models/Payments';
import { Methods } from '../models/Methods';
import { transaction } from 'objection'

export const Payments = (router) => {
    router.get('/payment-by/:company_id', async (ctx, next) => {
        let params = {...ctx.data}
        ctx.body = await PaymentsModel.query()
        .join("methods", "payments.method_id", "methods.id")
        .select("payments.id", "payments.discount", "payments.company_id", "methods.type")
        .where("company_id", ctx.params.company_id)
    })

    router.get('/all-methods', async (ctx,next) => {
        ctx.body = await Methods.query()
    })

    router.post('/add-payment', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.method_id) throw new Error("Para cadastrar um tipo de pagamento é preciso do method_id")
        if(!params.company_id) throw new Error("Para cadastrar um tipo de pagamento é preciso do company_id")

        let existentMethod = await PaymentsModel.query()
        .findOne({"method_id": params.method_id, "company_id": params.company_id})
        if(existentMethod) throw new Error("Já existe um metodo de pagamento para esse user")


        const payment = await PaymentsModel.query().insertAndFetch({
            discount: params.discount,
            method_id: params.method_id,
            company_id: params.company_id,
        })

        ctx.status = 200
        ctx.body = payment
    })

    router.delete('/delete-payment/:id', async (ctx, next) => {
        const trx = await transaction.start(PaymentsModel.knex())

        try{
            const deletedstock = await PaymentsModel.query().findById(ctx.params.id)
            if(!deletedstock) throw new Error("Não foi possivel encontrar o id do payment")

            await PaymentsModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedstock

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

}