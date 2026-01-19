import pino from 'pino'

const isDevelopment = process.env.NODE_ENV !== 'production'

// In production (bundled), use plain JSON logging
// In development, pino-pretty can be used via CLI: bun --watch src/index.ts | pino-pretty
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
})

export type Logger = typeof logger
