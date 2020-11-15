/**
 * Component to forward all log messages sent to bunyan to the Graylog-based log
 * aggregation service.
 */
import WebSocket from 'ws'
import { Writable } from 'stream'
import { server } from '../server'
import { bot } from '../../bot/bot'
import bunyan from 'bunyan'

export function init() {
	if (process.env.GRAYLOG_PROXY_URI) {
		server.logger.info('Setting up Graylog proxy...')
		setupGraylog()
	}
}

const setupGraylog = () => {
	let stream = new BunyanGraylogStream()

	server.logger.addStream({
		level: 'info',
		type: 'raw',
		stream
	})
	bot.logger.addStream({
		level: 'info',
		type: 'raw',
		stream
	})
}

class BunyanGraylogStream extends Writable {
	/**
	 * Map of bunyan logging levels to syslog levels
	 */
	static LEVEL_MAP = {
		60: 1, // alert
		50: 3, // error
		40: 4, // warning
		30: 6, // info
		20: 7 /// debug
	}

	queue: any[] = []
	ws!: WebSocket
	dead = false
	logger!: bunyan

	constructor() {
		super()
		this.createWebSocket()
		this.logger = server.logger.child({
			component: 'graylog'
		})

		setInterval(() => {
			this.sendPing()
		}, 10 * 1000)
	}

	write(record, cb) {
		if (this.dead) {
			if (cb) cb()
			return false
		}

		let obj = {
			version: '1.0',
			host: record.hostname,
			level: BunyanGraylogStream.LEVEL_MAP[record.level],
			short_message: record.msg,
			timestamp: new Date(record.time).getTime() / 1000
		}

		// Send all additional fields as well
		for (let k of Object.keys(record)) {
			obj['_' + k] = record[k]
		}

		this.queue.push(obj)
		this.tryPushQueue()

		if (cb) cb()
		return true
	}

	tryPushQueue() {
		if (this.ws && this.ws.readyState === 1) {
			let msg
			while ((msg = this.queue.pop())) {
				this.ws.send(
					JSON.stringify({
						action: 'log',
						payload: msg
					})
				)
			}
		}
	}

	createWebSocket() {
		if (this.dead) return

		// If there is already a WebSocket and it isn't closing/closed, just
		// return
		if (this.ws && this.ws.readyState < 2) {
			return
		}

		this.ws = new WebSocket(process.env.GRAYLOG_PROXY_URI)

		this.ws.on('error', err => {
			if (err.message.includes('502')) {
				// Authentication failed
				this.dead = true
			}

			this.logger.error({ err }, 'Could not connect to Graylog WS proxy.')
		})

		this.ws.on('close', (code, reason) => {
			server.logger.warn(
				{ component: 'graylog', code, reason },
				'Connection to Graylog WS proxy closed.'
			)
		})

		this.ws.on('open', () => {
			this.logger.info('Connected to Graylog WS proxy.')

			this.tryPushQueue()
		})
	}

	sendPing() {
		if (!this.ws || this.ws.readyState > 1) return

		let pongReceived = false
		const cb = msg => {
			try {
				let reply = JSON.parse(msg)
				if (reply.action === 'pong') pongReceived = true
			} catch (e) {}
		}

		this.ws.on('message', cb)
		this.ws.send(
			JSON.stringify({
				action: 'ping'
			})
		)

		setTimeout(() => {
			this.ws.off('message', cb)
			if (!pongReceived) {
				this.logger.error('Ping/pong failed, terminating and re-opening socket')
				this.ws.terminate()
				this.createWebSocket()
			}
		}, 2 * 1000)
	}
}
