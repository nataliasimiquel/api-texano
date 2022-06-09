import koa from 'koa';
import moment from 'moment';
import Router from 'koa-router';
import body from 'koa-body';
import http from 'http';
import Knex from 'knex';
import AuthenticationMiddleware from './middlewares/Authentication';
import AuthenticationPrivateMiddleware from './middlewares/AuthenticationPrivate';
import ActionLogMiddleware from './middlewares/ActionLog';
import { DefaultJobs } from './jobs/DefaultJobs';
import { DefaultEvents } from './events/DefaultEvents';
import { Strings } from './utils/Strings';
import { Model } from "objection";

const koaServer = new koa();

require('dotenv').config()

const server = http.createServer(koaServer.callback())
server.setTimeout(0);

const io = require('socket.io')(server, { serveClient: false })

const knex = Knex(require('./knexfile'))
Model.knex(knex)

server.listen(process.env.PORT || 8111)
console.log('Server running in http://localhost:' + (process.env.PORT || 8111))

koaServer.use(body())
koaServer.use(async (ctx, next) => {
	const lang = ctx.request.header['language'] || ""
	ctx.strings = Strings[lang.split("_")[0]] || Strings['en']
	ctx.started_at = moment()

	ctx.logs = {
		send_mail_error: false,
		save_db: true,
	}
    if(ctx.method === "GET") ctx.data = {...require('url').parse(ctx.request.url, true).query, ...ctx.params};
    else ctx.data = {...ctx.request.body};

    console.log(ctx.method, ctx.url)

	ctx.set('Access-Control-Allow-Origin', ctx.request.header.origin || '*')
	ctx.set('Access-Control-Allow-Headers', ctx.request.header['access-control-request-headers'] || '*')
	ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH, DELETE')
	ctx.set('Access-Control-Allow-Credentials', 'true')
	ctx.set('Allow', 'POST, GET, OPTIONS, PUT, PATCH, DELETE')
	ctx.set('Server', 'ApiServer')
	if (ctx.method === 'OPTIONS') {
		ctx.body = ''
		return
	}
	await next();
})

io.on('connection', (socket) => {
	DefaultEvents(socket)
})

DefaultJobs({io})

koaServer.use(ActionLogMiddleware)
koaServer.use(AuthenticationMiddleware)

const checkRouter = new Router({ prefix: '/check' })
import { Check } from './lib/general/Check'
Check(checkRouter)
koaServer.use(checkRouter.routes())

const authRouter = new Router({ prefix: '/auth' })
import { Auth } from './lib/general/Auth'
Auth(authRouter)
koaServer.use(authRouter.routes())

const webhooksRouter = new Router({ prefix: '/hooks' })
import { Webhooks } from './lib/general/Webhooks'
Webhooks(webhooksRouter)
koaServer.use(webhooksRouter.routes())

// private routes
koaServer.use(AuthenticationPrivateMiddleware)

const usersRouter = new Router({ prefix: '/users' })
import { Users } from './lib/general/Users'
Users(usersRouter)
koaServer.use(usersRouter.routes())

const itensRouter = new Router({ prefix: '/itens' })
import { Itens } from './lib/general/Itens'
Itens(itensRouter)
koaServer.use(itensRouter.routes())

const categoriesRouter = new Router({ prefix: '/categories' })
import { Categories } from './lib/general/Categories'
Categories(categoriesRouter)
koaServer.use(categoriesRouter.routes())

const stockRouter = new Router({ prefix: '/stock' })
import { Stock } from './lib/general/Stock'
Stock(stockRouter)
koaServer.use(stockRouter.routes())

const paymentsRouter = new Router({ prefix: '/payments' })
import { Payments } from './lib/general/Payments'
Payments(paymentsRouter)
koaServer.use(paymentsRouter.routes())

const roomRouter = new Router({ prefix: '/rooms' })
import { Rooms } from './lib/general/Rooms'
Rooms(roomRouter)
koaServer.use(roomRouter.routes())

const serviceRouter = new Router({ prefix: '/services' })
import { Services } from './lib/general/Services'
Services(serviceRouter)
koaServer.use(serviceRouter.routes())

const serviceRoomRouter = new Router({ prefix: '/servicesrooms' })
import { ServicesRooms } from './lib/general/ServicesRooms'
ServicesRooms(serviceRoomRouter)
koaServer.use(serviceRoomRouter.routes())

const availabilityRouter = new Router({ prefix: '/availability' })
import { Availability } from './lib/general/Availability'
Availability(availabilityRouter)
koaServer.use(availabilityRouter.routes())

const customerRouter = new Router({ prefix: '/customer' })
import { Customer } from './lib/general/customer'
Customer(customerRouter)
koaServer.use(customerRouter.routes())

const schedulesRouter = new Router({ prefix: '/schedules' })
import { Schedules } from './lib/general/Schedules'
Schedules(schedulesRouter)
koaServer.use(schedulesRouter.routes())

const schedules_datesRouter = new Router({ prefix: '/schedules_dates' })
import { Schedules_dates } from './lib/general/Schedules_dates'
Schedules_dates(schedules_datesRouter)
koaServer.use(schedules_datesRouter.routes())


const contentsRouter = new Router({ prefix: '/contents' })
import { Contents } from './lib/general/Contents'
Contents(contentsRouter)
koaServer.use(contentsRouter.routes())
