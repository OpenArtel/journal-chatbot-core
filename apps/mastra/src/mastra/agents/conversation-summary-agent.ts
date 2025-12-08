import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { gptOss120 } from '../models'

export const conversationSummaryAgent = new Agent({
	name: 'Conversation Summary Agent',
	instructions: `
    Ты помощник психолога.
	Твоя задача провести анализ пользователя и составить краткое представление для передачи его психологу.

    КРАТКО И ЯСНО
	ЧТОБЫ ЧТЕНИЕ ЗАНЯЛО ДВЕ МИНУТЫ
	БЕЗ РЕКОМЕНДАЦИЙ И СОВЕТОВ И ПРИМЕЧАНИЙ

	Формат:
	1. Описание состояния пользователя
	2. Темы, заботы и переживания
`,
	model: gptOss120({ temperature: 0, max_tokens: 0 }),
	tools: {},
	memory: new Memory({
		options: {
			lastMessages: false,
			threads: {
				generateTitle: false,
			},
		},
	}),
})
