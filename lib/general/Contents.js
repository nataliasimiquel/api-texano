import { Attributes } from '../models/Attributes';
import { ContentsTypes } from '../models/ContentsTypes';
import { Contents as ContentsModel } from '../models/Contents';
import { ContentAttributes } from '../models/ContentAttributes';
import { transaction } from 'objection'
import { raw } from 'objection'
import md5 from 'md5'

export const Contents = (router) => {
    //endpoint sobre a tabela contents
    //etapa 1
    router.post('/content', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.contents_types_id) throw new Error("Para fazer um post precisa do contents_types_id")

        const post = await ContentsModel.query().insertAndFetch({
            contents_types_id: params.contents_types_id,
        })
        ctx.body = post
    })

    //endpoint sobre a tabela contents_types
    router.get('/all-types', async (ctx, next) => {
        let params = {...ctx.data}
        ctx.body = await ContentsTypes.query()
        .where("contents_types.company_id", ctx.companyProfile.company_id)
    })

    router.get('/attributes-by/:uuid', async (ctx, next) => {
        let params = {...ctx.data}

        const contents = await ContentAttributes.query().withGraphFetched("content_type")
        .join("contents_types", "content_attributes.contents_types_id", "contents_types.id")
        .where("contents_types.uuid", ctx.params.uuid)

        const attributes = await Attributes.query().withGraphFetched("content_attribute.content_type")
        .join("content_attributes", "attributes.content_attributes_id", "content_attributes.id")
        .join("contents_types", "content_attributes.contents_types_id", "contents_types.id")
        .where("contents_types.uuid", ctx.params.uuid)

        ctx.body = attributes
    })

    router.get('/contents-types/:uuid', async (ctx, next) => {
        let params = {...ctx.data}

        ctx.body = await ContentsTypes.query()
        .where("contents_types.uuid", ctx.params.uuid)

    })

    router.post('/add-type', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.title) throw new Error("Para adicionar um tipo de conteudos é preciso colocar o tipo")
        if(!params.company_id) throw new Error("Para adicionar um tipo de conteudos é preciso do company_id")

        /* let existent = await ContentsTypes.query()
        .findOne({"title": params.title.toUpperCase(), "company_id": params.company_id})
        if(existent) throw new Error("Já existe um tipo de conteudo para seu usuário") */

        const contentsType = await ContentsTypes.query().insertAndFetch({
            title: params.title.toUpperCase(),
            company_id: params.company_id,
            uuid: raw(`md5('${params.uuid}')`),
        })
        ctx.body = contentsType
    })

    router.delete('/delete-type/:id', async (ctx, next) => {
        const trx = await transaction.start(ContentsTypes.knex())

        try{
            const deletedType = await ContentsTypes.query().findById(ctx.params.id)
            if(!deletedType) throw new Error("Não foi possivel encontrar o id do contentsType")
            await ContentsTypes.query(trx).deleteById(ctx.params.id)
            await trx.commit()
            ctx.body = deletedType

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    //endpoint sobre a tabela contents_attributes
    //etapa 2
    router.post('/add-content-attributes', async (ctx, next) => {
        let params = {...ctx.data};

        try {
            if(params.title && params.title.length !== 0) {
                const tempList = []
                let all = await Promise.all(
                    params.title.map(async(value) => {
                        const temp = await ContentAttributes.query().insertAndFetch({
                            contents_types_id: params.contents_types_id,
                            title: value,
                        })
                        tempList.push(temp)
                    })
                ) 
                ctx.body = await tempList
            } else {
                const value = await ContentAttributes.query().insertAndFetch({
                    contents_types_id: params.contents_types_id,
                    title: params.title,
                })
                ctx.body = value;
            }
        ctx.status = 200
        } catch (error) {
            ctx.status = 400
            ctx.body = error.message
        }
    })

    //endpoints sobre a tabela attributes
    //etapa 3
    router.post('/popular-value', async (ctx, next) => {
        let params = {...ctx.data}
        let array = []
        try {
            for(let k in params){
                array.push(params[k])
            }
            if(params && params.length !== 0) {
                let res = await Promise.all(
                    array.map(async(a) => {
                        const getAttributes = await Attributes.query().insertGraphAndFetch({
                            content_attributes_id: a.content_attributes_id,
                            contents_id: a.contents_id,
                            value: a.value,
                        })
                        array.push(getAttributes)
                    })
                )
                ctx.body = await array
            } else {
                const attributes = await Attributes.query().insertAndFetch({
                    content_attributes_id: params.content_attributes_id,
                    contents_id: params.contents_id,
                    value: params.value,
                })
                ctx.status = 200
                ctx.body = attributes
            }

        } catch (error) {
            ctx.status = 400
            ctx.body = error.message
        }
    })

}