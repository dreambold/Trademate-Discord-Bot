import { server } from '../server'
import fs from 'fs-extra'
import path from 'path'

export function init() {
	server.koa.use(async (ctx, next) => {
		await next()

		// if (ctx.status === 404) {
		//     ctx.set('Content-Type', 'text/html')
		//     ctx.body = await fs.readFile(
		//         path.join(__dirname, '../../../frontend/index.html')
		//     )
		// }
	})
}
