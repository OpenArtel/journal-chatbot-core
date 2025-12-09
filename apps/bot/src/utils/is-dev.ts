import { env } from 'bun'

export const isDev = env.NODE_ENV === 'development'
