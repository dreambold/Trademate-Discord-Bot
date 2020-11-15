import globby from 'globby'
import path from 'path'

/**
 * Globs for all `paths` in `dirname`, then requires all these files and runs
 * the method.
 */
export async function autoload(
	dirname: string,
	paths: string[],
	method = 'init',
	args: any[] = []
) {
	const files = await globby(
		paths.map(p => path.join(dirname, p).replace(/\\/g, '/'))
	)

	for (let file of files.filter(f => f.endsWith('.js'))) {
		let mod = require(file)

		if (typeof mod[method] === 'function') {
			await mod[method](...args)
		}
	}
}
