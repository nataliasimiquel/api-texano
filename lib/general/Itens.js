import { Products } from '../models/Products';
import { Categories } from '../models/Categories';
import { ProductCategory } from '../models/ProductCategory';
import { raw } from 'objection'
import { transaction } from 'objection'

export const Itens = (router) => {
    router.get('/all-products/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        ctx.body = await Products.query().withGraphFetched("product_category.category")
        .where("products.company_id", ctx.params.company_id)
        .where("status", 1)
    })

    router.post('/add-products', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.name) throw new Error("Para adicionar um produto é preciso colocar um Nome")
        if(!params.price) throw new Error("Para adicionar um produto é preciso colocar um Preço")
        if(typeof(params.price) !== "number") throw new Error("Adicione um valor válido para o preço")

        let existentProduct = await Products.query()
        .findOne({"name": params.name.toLowerCase(), "company_id": params.company_id})
        if(existentProduct) throw new Error("Já existe um produto com esse name")

        const product = await Products.query().insertAndFetch({
            name: params.name.toUpperCase(),
            image: params.image,
            price: parseFloat(params.price),
            company_id: params.company_id,
            description: params.description,
            status: params.status
        })

        ctx.status = 200
        ctx.body = product
    })

    router.patch('/edit-products/:id', async (ctx, next) => {
        let params = {...ctx.data}
        const trx = await transaction.start(Products.knex())

        try{
            const editedProduct = await Products.query(trx)
            .updateAndFetchById(ctx.params.id, params)
                
            await trx.commit()
            ctx.status = 200
            ctx.body = editedProduct

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })
    
    router.delete('/delete-product/:id', async (ctx, next) => {
        const trx = await transaction.start(Products.knex())

        try{
            const deletedProduct = await Products.query().findById(ctx.params.id)
            if(!deletedProduct) throw new Error("Não foi possivel encontrar o id do produto")
            
            await Products.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedProduct

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })
}