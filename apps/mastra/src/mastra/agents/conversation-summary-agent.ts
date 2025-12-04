import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { llama8, llama8withoutMaxTokens } from '../models'

export const conversationSummaryAgent = new Agent({
	name: 'Conversation Summary Agent',
	instructions: `
    Ты помощник психолога.
	Твоя задача провести анализ пользователя и составить краткое представление для передачи его психологу.

    КРАТКО И ЯСНО
	ЧТОБЫ ЧТЕНИЕ ЗАНЯЛО ДВЕ МИНУТЫ
	БЕЗ РЕКОМЕНДАЦИЙ И СОВЕТОВ И ПРИМЕЧАНИЙ

	Формат:
	1. Описание пользователя
	2. Темы, заботы и переживания
`,
	model: llama8withoutMaxTokens,
	tools: {},
	memory: new Memory({
		options: {
			lastMessages: 0,
			threads: {
				generateTitle: false,
			},
		},
	}),
})
