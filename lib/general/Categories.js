import { Categories as CategoriesModel } from '../models/Categories';
import { ProductCategory } from '../models/ProductCategory';
import { raw } from 'objection'
import { transaction } from 'objection'

export const Categories = (router) => {
    router.get('/all-by/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        ctx.body = await CategoriesModel.query()
        .where("company_id", ctx.params.company_id)
        .where("status", 1)
    })

    router.post('/add-category', async (ctx, next) => {
        const trx = await transaction.start(CategoriesModel.knex())
        try {
            let params = {...ctx.data}
            if(!params.category_name) throw new Error("Para adicionar um produto é preciso colocar um Nome")
            if(!params.company_id) throw new Error("Para adicionar um produto é preciso do company_id")
            if(!params.status) throw new Error("Para adicionar um produto é preciso do status")
            
            let existentCategory = await CategoriesModel.query()
            .findOne({"category_name": params.category_name.toUpperCase(), "company_id": params.company_id})
            if(existentCategory) throw new Error("Já exist uma categoria com esse nome para esse usuário")

            const category = await CategoriesModel.query(trx).insertAndFetch({
                category_name: params.category_name.toUpperCase(),
                company_id: params.company_id,
                status: params.status
            })
            await trx.commit()
            ctx.status = 200
            ctx.body = category
        } catch (error) {
            await trx.rollback()
            ctx.status = 400
            ctx.body = error.message
        }
        
    })

    router.post('/link-product_id/with-category_id', async (ctx,netx) => {
        const trx = await transaction.start(ProductCategory.knex())
        let params = {...ctx.data};
        let linkProduct;
        try {
            if(params.category_id.length){
                const tempList = []
                const existent = false;
                params.category_id.map(()=>{})

                await Promise.all(
                    params.category_id.map(async(id) => {
                            const tempExistent = await ProductCategory.query()
                            .findOne({"product_id": params.product_id, "category_id": id})
                            if(tempExistent) console.log("No de cima",existent);
                            test = await ProductCategory.query(trx).insertAndFetch({
                                product_id: params.product_id,
                                category_id: id
                            })
                            console.log(test);
                            tempList.push(test)
                    })
                ) 

                linkProduct = tempList;
            }else{
                    const existent = await ProductCategory.query()
                    .findOne({"product_id": params.product_id, "category_id": params.category_id})
                    console.log("Entrou no de baixo",existent);
                    if(existent) throw new Error("Já foi adicionado essa categoria para esse produto")
                    linkProduct =  await ProductCategory.query(trx).insertAndFetch({
                        product_id: params.product_id,
                        category_id: params.category_id
                    })
            }
            await trx.commit()
            ctx.status = 200
            ctx.body = linkProduct;
        } catch (error) {
            await trx.rollback()
            ctx.status = 400
            ctx.body = error.message
        }   

       
    })

    router.delete('/unlink-category/:product_category_id', async (ctx, next) => {
        const trx = await transaction.start(ProductCategory.knex())

        try{
            const deletedCategory = await ProductCategory.query().findById(ctx.params.product_category_id)
            if(!deletedCategory) throw new Error("Não foi possivel encontrar o id da product_category")

            await ProductCategory.query(trx).deleteById(ctx.params.product_category_id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedCategory

        } catch(err){
            await trx.rollback()
            ctx.status = 400
            ctx.body = err.message
        }
    })

    router.delete('/delete-category/:id', async (ctx, next) => {
        const trx = await transaction.start(CategoriesModel.knex())

        try{
            const deletedCategory = await CategoriesModel.query().findById(ctx.params.id)
            if(!deletedCategory) throw new Error("Não foi possivel encontrar o id da categoria")

            await CategoriesModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedCategory

        } catch(err){

            await trx.rollback()
            ctx.status = 400
            ctx.body = err.message
        }
    })

}