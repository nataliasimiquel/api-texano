import { transaction } from 'objection';
import { Losses } from '../models/Losses';
import { Sales } from '../models/Sales';
import { Stock as StockModel } from '../models/Stock';
import StockService from '../../services/StockService'
import moment from 'moment'


export const Stock = (router) => {
    //endpoints stock
    router.get('/all-by/:company_id', async (ctx, next) => {
        let params = {...ctx.data}
        ctx.body = await StockModel.query().withGraphFetched("product")
        .join("products", "stock.product_id", "products.id")
        .where("company_id", ctx.params.company_id)
    })

    router.get('/ending-stock/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        const company_id = ctx.params.company_id

        const stock = await StockModel.query().withGraphFetched("product")
        .join("products", "stock.product_id", "products.id")
        .select("stock.amount")
        .where("products.company_id", company_id)
        
        ctx.body = stock
    })

    router.get('/validate-stock-expiration/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        const company_id = ctx.params.company_id
        const stock = await StockModel.query().withGraphFetched("product")
        .join("products", "stock.product_id", "products.id")
        .where("company_id", company_id)

        const validExpiration = (s) => {
            if((moment().add(7,'days').format()) >= (moment(s.due_date).format())) return true
            else return false
        }

        const validSpoiled = (s) => {
            if((moment().format()) >= (moment(s.due_date).format())) return true
            else return false
        }

        const stocksMap = stock.map(stock =>({
            id: stock.id,
            amount: stock.amount,
            price: stock.price,
            stock_date: stock.stock_date,
            due_date: stock.due_date,
            company_id: stock.product.company_id,
            product: stock.product.name,

            closeToSpoiling: validExpiration(stock),
            spoiled: validSpoiled(stock)
        }))

       ctx.body = stocksMap.filter(item => item.closeToSpoiling === true)
    })

    router.post('/add-stock', async (ctx, next) => {
        let params = {...ctx.data }
        if(!params.amount) throw new Error("Para criar uma stock é preciso da quantidade")
        if(!params.price) throw new Error("Para criar uma stock é preciso do preço")
        if(!params.product_id) throw new Error("Para criar uma stock é preciso do id do produto")
        if(!params.stock_date) throw new Error("Para criar uma stock é preciso da data que entrou no estoque")
        if(!params.due_date) throw new Error("Para criar uma stock é preciso da data de vencimento do estoque")

        const stock = await StockModel.query().insertAndFetch({
            amount: params.amount,
            price: params.price,
            status: params.status,
            product_id: params.product_id,
            stock_date: moment(params.stock_date).format("YYYY-MM-DD"),
            due_date: moment(params.due_date).format("YYYY-MM-DD")
        })

        ctx.status = 200
        ctx.body = stock
    })

    router.delete('/delete-stock/:id', async (ctx, next) => {
        const trx = await transaction.start(StockModel.knex())

        try{
            const deletedstock = await StockModel.query().findById(ctx.params.id)
            if(!deletedstock) throw new Error("Não foi possivel encontrar o id do stock")

            await StockModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedstock

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    //começa endpoints perdas
    router.get('/all-losses', async (ctx, next) => {
        const losses = await Losses.query().withGraphFetched("stock(productId).product(selectInfo)")
        .modifiers({
           selectInfo(builders) {
               builders.select("products.name")
           }, productId(builders) {
            builders.select("stock.product_id")   
           }
        }).select("losses.id", "losses.amount", "losses.company_id", "losses.loss_date")

        ctx.body = losses
    })

    router.get('/ending-products/:company_id', async (ctx, next) => {
        let params = {...ctx.data }

        let company_id = ctx.params.company_id
        const listStock = await StockModel.query().join("products", "stock.product_id", "products.id")
        .withGraphFetched("product")
        .where("products.company_id", company_id)
        const array = [];
        const allLosses = await listStock.reduce(async(filtered, option)=>{
            const losses = await StockService.getSumLosses(option.id)
            const sales = await StockService.getSumSales(option.id)
            console.log(`id:${option.id}, losses${losses}, sales${sales}`);

            if(losses || sales){
                var amountLeft = option.amount - (losses + sales);
                if((amountLeft/option.amount)<=0.15){
                var newValue = {...option,amount:amountLeft};
                array.push(newValue);
                }
            }
            return filtered
        },array)
        console.log("Todas as perdas", allLosses);
        ctx.body = allLosses
    })

    router.post('/post-loss', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.amount) throw new Error("Para criar uma perda é preciso da quantidade")
        if(!params.loss_date) throw new Error("Para criar uma perda é preciso da data")
        if(!params.company_id) throw new Error("Para criar uma perda é preciso do id da empresa")
        if(!params.stock_id) throw new Error("Para criar uma perda é preciso do id do perda")

        const loss = await Losses.query().insertAndFetch({
            amount: params.amount,
            loss_date: moment(params.loss_date).format("YYYY-MM-DD"),
            company_id: params.company_id,
            stock_id: params.stock_id
        })

        ctx.status = 200
        ctx.body = loss
    })

    router.delete('/delete-losses/:id', async (ctx, next) => {
        const trx = await transaction.start(Losses.knex())

        try{
            const deleteLosses = await Losses.query().findById(ctx.params.id)
            if(!deleteLosses) throw new Error("Não foi possivel encontrar o id da perda")

            await Losses.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deleteLosses

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    //começa endpoints vendas
    router.get('/all-sales/:company_id', async (ctx, next) => {
        const company_id = ctx.params.company_id

        const sales = await Sales.query().withGraphFetched("stock.product")
        .where("company_id", ctx.params.company_id)

        ctx.body = sales

    })

    router.get('/sale-of/date/by/:company_id', async (ctx, next) => {
        let params = {...ctx.data }
        
        let company_id = ctx.params.company_id
        let date = moment().format("YYYY-MM-DD")

        const saleOfDay = await StockService.getSaleOfDay(date, company_id) 

        ctx.body = saleOfDay
    })

    router.post('/post-sales', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.amount) throw new Error("Para criar uma venda é preciso da quantidade")
        if(!params.company_id) throw new Error("Para criar uma venda é preciso do company_id")
        if(!params.sale_date) throw new Error("Para criar uma venda é preciso da data da venda")
        if(!params.stock_id) throw new Error("Para criar uma perda é preciso do stock_id")
        if(!params.method_id) throw new Error("Para criar uma perda é preciso do method_id")
        if(!params.price) throw new Error("Para criar uma perda é preciso do price")

        const stock = await StockService.getSumStock(params.stock_id)
        const losses = await StockService.getSumLosses(params.stock_id)
        const sales = await StockService.getSumSales(params.stock_id) 
        const stockQuantity = stock-((losses?losses:0)+(sales?sales:0))

        if(params.amount <= stockQuantity) {
            const sales = await Sales.query().insertAndFetch({
                amount: params.amount,
                company_id: params.company_id,
                sale_date: moment(params.sale_date).format("YYYY-MM-DD"),
                stock_id: params.stock_id,
                method_id: params.method_id,
                price: params.price
            })

            ctx.body = sales
        } else {
            throw new Error(`Não há essa quantidade no estoque, possuindo ${stockQuantity} restantes`)
        }
    })

    router.get('/ver-validacao/:stock_id', async (ctx, next) => {
        let params = {...ctx.data}

        let stock_id = ctx.params.stock_id
        const stock = await StockService.getSumStock(stock_id)
        const losses = await StockService.getSumLosses(stock_id)
        const sales = await StockService.getSumSales(stock_id) 

        console.log(`stock:${stock}, losses${losses}, sales${sales}`);

        const stockQuantity = stock-((losses?losses:0)+(sales?sales:0))

        ctx.body = stockQuantity
    })


    router.get('/ending-products/:company_id', async (ctx, next) => {
        let params = {...ctx.data }

        let company_id = ctx.params.company_id
        const listStock = await StockModel.query().join("products", "stock.product_id", "products.id")
        .withGraphFetched("product")
        .where("products.company_id", company_id)
        const array = [];
        const allLosses = await listStock.reduce(async(filtered, option)=>{
            const losses = await StockService.getSumLosses(option.id)
            const sales = await StockService.getSumSales(option.id)
            console.log(`id:${option.id}, losses${losses}, sales${sales}`);

            if(losses || sales){
                var amountLeft = option.amount - (losses + sales);
                if((amountLeft/option.amount)<=0.15){
                var newValue = {...option,amount:amountLeft};
                array.push(newValue);
                }
            }
            return filtered
        },array)
        console.log("Todas as perdas", allLosses);
        ctx.body = allLosses
    })

    router.delete('/delete-sales/:id', async (ctx, next) => {
        const trx = await transaction.start(Sales.knex())

        try{
            const deleteSales = await Sales.query().findById(ctx.params.id)
            if(!deleteSales) throw new Error("Não foi possivel encontrar o id da venda")

            await Sales.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deleteSales

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }

    })
    

}