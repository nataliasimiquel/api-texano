import { Losses } from '../lib/models/Losses';
import { Sales } from '../lib/models/Sales';
import { Stock } from '../lib/models/Stock'; 

class StockService{

    async getSumLosses(stock_id){
        const sum = await Losses.query()
        .where("losses.stock_id", stock_id)
        .sum('amount')

        return parseInt(sum[0].sum)
    }

    async getSumSales(stock_id){
        const sum = await Sales.query()
        .where("sales.stock_id", stock_id)
        .sum('amount')

        return parseInt(sum[0].sum)
    }

    async getSumStock(stock_id){
        const sum = await Stock.query()
        .where("stock.id", stock_id)
        .sum('amount')

        return parseInt(sum[0].sum)
    }

    async getSaleOfDay(date, company_id){
        const findData = await Sales.query()
        .findOne("sale_date", date)

        if(findData){
            const saleOfDay = await Sales.query()
            .where({"sale_date": date, "company_id": company_id})
            .sum('price')
            return parseInt(saleOfDay[0].sum)
        }
        return 0

    }

    async getSoctkAvailability(company_id,stock_id){
        const sumLosses = await Losses.query()
        .where({"losses.company_id": company_id,"losses.stock_id":stock_id})
        .sum('amount')
        // const unavailable = 

        if(sumLosses[0].sum === null) {
            const stockFinal = parseInt(sumStock[0].sum) - (parseInt(sumSales[0].sum))
            return stockFinal
        } else {
            const stockFinal = parseInt(sumStock[0].sum) - (parseInt(sumSales[0].sum) + parseInt(sumLosses[0].sum))
            return stockFinal
        }
    }


}
const service = new StockService()
Object.freeze(service)

export default service
