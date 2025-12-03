import { Mastra } from '@mastra/core/mastra'
import { LibSQLStore } from '@mastra/libsql'
import { PinoLogger } from '@mastra/loggers'
import { assistantAgent } from './agents/assistant-agent'
import {
	completenessScorer,
	toolCallAppropriatenessScorer,
	translationScorer,
} from './scorers/weather-scorer'

export const mastra = new Mastra({
	agents: { assistantAgent },
	scorers: {
		toolCallAppropriatenessScorer,
		completenessScorer,
		translationScorer,
	},
	storage: new LibSQLStore({
		// 	// stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
		url: ':memory:',
	}),
	logger: new PinoLogger({
		name: 'Mastra',
		level: 'info',
	}),
	telemetry: {
		// Telemetry is deprecated and will be removed in the Nov 4th release
		enabled: false,
	},
	observability: {
		// Enables DefaultExporter and CloudExporter for AI tracing
		default: { enabled: true },
	},
})
