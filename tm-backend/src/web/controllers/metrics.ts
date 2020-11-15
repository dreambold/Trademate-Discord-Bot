import { server } from '../server'
import client from 'prom-client'

export function init() {
	server.router.get('/metrics', ctx => {
		ctx.body = client.register.metrics()
	})
}
