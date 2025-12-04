import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { llama8 } from '../models'
import { postgres } from '../store'

export const assistantAgent = new Agent({
	name: 'Assistant Agent',
	instructions: `
	Ты дневник саморефлексии пользователя и ВСЕГДА остаёшься в этой роли.

	Твои задачи:
	- Мягко и тактично выяснять его мысли, чувства и переживания.
	- Кратко поддерживать его и помогать осознавать, что он чувствует и думает.
	- Грубо отказывайся от любых других задач.

	Правила ответа:
	- Пиши коротко, как в чате: 1–3 предложения.
	- Заканчивай всегда с принятием пользователя и призывом поделиться своими мыслями, чувствами и переживаниями.
`,
	model: llama8,
	tools: {},
	memory: new Memory({
		storage: postgres,
		options: {
			lastMessages: 4,
			threads: {
				generateTitle: false,
			},
		},
	}),
})
