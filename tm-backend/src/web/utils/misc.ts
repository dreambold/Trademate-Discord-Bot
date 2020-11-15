export const CACHE_RESET = Symbol('tmp_value_cache_reset')

export function tempValueCache<T>(lengthSeconds: number) {
	let v: T | undefined
	let time = Date.now()

	return function(val?: T | typeof CACHE_RESET): T | undefined {
		if (val !== undefined || time + lengthSeconds * 1000 < Date.now()) {
			if (val === CACHE_RESET) v = undefined
			else v = val

			time = Date.now()
		}

		return v
	}
}

export class APIError extends Error {
	constructor(message, readonly code = 500) {
		super(message)
	}
}

export async function mapAsync<T, V>(
	data: T[],
	f: (entry: T) => Promise<V>
): Promise<V[]> {
	return await Promise.all(data.map(f))
}
