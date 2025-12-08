// Source: https://barrad.me/post/job-system-pgboss-typescript/
// https://gist.github.com/Flowko/4ae7a157d9db634bb6a91a5b867b44d5
/** biome-ignore-all lint/suspicious/noExplicitAny: так задумал автор */

import type { PgBoss, SendOptions, WorkHandler } from 'pg-boss'
import type { z } from 'zod'

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set')
}

class JobBuilder<TInput = any> {
	_name: string
	_inputSchema?: z.ZodType<TInput>
	_options: SendOptions = {
		retryLimit: 3,
		retryDelay: 1000,
	}
	_handler?: WorkHandler<TInput>
	_boss?: PgBoss

	constructor(name: string) {
		this._name = name
	}

	input<T>(schema: z.ZodType<T>): JobBuilder<T> {
		this._inputSchema = schema as any
		return this as any
	}

	options(opts: SendOptions): this {
		this._options = { ...this._options, ...opts }
		return this
	}

	work(handler: WorkHandler<TInput>): this {
		const wrappedHandler: WorkHandler<TInput> = async (jobs) => {
			try {
				return await handler(jobs)
			} catch (error) {
				console.error(`Job ${this._name} failed`, error)
				throw error
			}
		}
		this._handler = wrappedHandler
		return this
	}

	// Internal method to set PgBoss instance
	_setBoss(boss: PgBoss): this {
		this._boss = boss
		return this
	}

	// Method to emit/schedule a job
	async emit(data: TInput) {
		if (!this._boss) {
			throw new Error('Job not registered with JobManager')
		}

		if (this._inputSchema) {
			// Validate input data against schema
			this._inputSchema.parse(data)
		}

		console.debug('Job emitted', { name: this._name })
		return await this._boss.send(this._name, data as any, this._options)
	}

	async start() {
		if (!this._boss) {
			throw new Error('Job not registered with JobManager')
		}

		return await this._boss.start()
	}

	async emitAfter(data: TInput, seconds: number) {
		if (!this._boss) {
			throw new Error('Job not registered with JobManager')
		}

		return await this._boss.sendAfter(
			this._name,
			data as any,
			this._options,
			seconds,
		)
	}

	async schedule(data: TInput, cronExpression: string) {
		if (!this._boss) {
			throw new Error('Job not registered with JobManager')
		}

		return await this._boss.schedule(this._name, cronExpression, data as any)
	}

	build() {
		if (!this._handler) {
			throw new Error(`No handler defined for job ${this._name}`)
		}

		return {
			name: this._name,
			schema: this._inputSchema,
			options: this._options,
			handler: this._handler,
		}
	}
}

export const defineJob = (name: string) => new JobBuilder(name)

export class JobManager {
	private boss: PgBoss
	private jobs: JobBuilder[] = []

	constructor(boss: PgBoss) {
		this.boss = boss
	}

	register(...jobs: JobBuilder[]): this {
		for (const job of jobs) {
			// Set the PgBoss instance on each job
			job._setBoss(this.boss)
			this.jobs.push(job)
		}
		return this
	}

	async start() {
		this.boss = await this.boss.start()

		for (const job of this.jobs) {
			const built = job.build()

			await this.boss.createQueue(built.name)
			await this.boss.work(built.name, built.handler)
		}
	}
}
