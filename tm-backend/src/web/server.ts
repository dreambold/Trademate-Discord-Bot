import Koa from 'koa'
import Router from 'koa-router'
import bunyan from 'bunyan'
import path from 'path'
import koaStatic from 'koa-static'
import koaSession from 'koa-session'
import koaBody from 'koa-body'
import { autoload } from './utils/autoload'

export class Server {
	koa!: Koa
	router!: Router
	logger: bunyan

	constructor() {
		this.logger = bunyan.createLogger({
			name: 'web'
		})
		this.createServer()
	}

	async run() {
		await this.loadFiles()

		this.koa.listen(parseInt(process.env.WEB_PORT))
		this.logger.info(
			`Now listening on http://127.0.0.1:${process.env.WEB_PORT}/`
		)
	}

	private createServer() {
		this.koa = new Koa()
		this.router = new Router()

		this.koa.use(
			koaStatic(path.join(__dirname, '..', '..', '..', 'tm-frontend', 'dist'))
		)
		this.koa.use(koaBody())
		this.koa.use(
			koaSession(
				{
					maxAge: 86400000,
					signed: false,
					renew: true
				},
				this.koa
			)
		)

		this.koa.use(this.router.routes())
		this.koa.use(this.router.allowedMethods())
	}

	private async loadFiles() {
		const paths = [
			'components/**/*.js',
			'middleware/*.js',
			'controllers/**/*.js'
		]

		await autoload(__dirname, paths, 'init')
	}
}

export const server = new Server()
