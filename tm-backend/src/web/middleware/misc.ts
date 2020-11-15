import { Context } from 'koa'
import { FlagEnabled } from '../../common/flags'
import { DbUser, UserPermission } from '../../common/db/models/user'
import { APIError } from '../utils/misc'

export function init() {}

export function FlagRequiredMiddleware(
	featureName: string,
	dataValidator?: (data: any) => boolean
) {
	return (ctx: Context, next: any) => {
		if (!FlagEnabled(featureName, dataValidator)) {
			return
		}

		return next()
	}
}

export function NeedsPermissionMiddleware(
	perms: UserPermission | UserPermission[]
) {
	let _perms = Array.isArray(perms) ? [...perms] : [perms]

	return async (ctx: Context, next: () => Promise<any>) => {
		const user = ctx.state.user as DbUser
		const up = user.permissions

		if (
			!user ||
			(user.rank <= 0 &&
				!_perms.every(p => up.includes(p)) &&
				!up.includes('ADMINISTRATOR'))
		) {
			throw new APIError('Access denied')
		} else {
			return next()
		}
	}
}
