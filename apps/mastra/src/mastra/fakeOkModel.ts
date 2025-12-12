import type { AgentConfig } from '@mastra/core/agent'

export function fakeOkModel(): AgentConfig['model'] {
	return {
		specificationVersion: 'v1',
		provider: 'custom',
		modelId: 'fake-ok-model',
		defaultObjectGenerationMode: 'json',

		async doGenerate() {
			return {
				rawCall: { rawPrompt: null, rawSettings: {} },
				finishReason: 'stop',
				usage: {
					promptTokens: 0,
					completionTokens: 1,
					totalTokens: 1,
				},
				text: 'OK',
				toolCalls: [],
				warnings: [],
			}
		},

		async doStream(options) {
			return {
				stream: new ReadableStream({
					async start(controller) {
						controller.enqueue({
							type: 'text-delta',
							textDelta: 'OK',
						})
						controller.enqueue({
							type: 'finish',
							finishReason: 'stop',
							usage: {
								promptTokens: 0,
								completionTokens: 1,
							},
						})
						controller.close()
					},
				}),
				rawCall: { rawPrompt: null, rawSettings: {} },
				warnings: [],
			}
		},
	}
}
