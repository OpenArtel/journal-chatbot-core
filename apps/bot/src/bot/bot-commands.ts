import type { Bot } from 'grammy'
import type { MyContext } from './bot'
import {
	CLEAR_CURRENT_DAY_COMMAND_NAME,
	clearCurrentDayCommand,
	clearCurrentDayCommandDescription,
} from './clear-current-day'
import {
	DAILY_COMMAND_NAME,
	dailyBotCommandDescription,
	dailySummaryMenu,
} from './daily.command'
import { START_COMMAND_NAME, startCommand } from './start.command'
import { TEST_COMMAND_NAME, testCommand } from './test.command'

export const knownCommands = [
	START_COMMAND_NAME,
	DAILY_COMMAND_NAME,
	CLEAR_CURRENT_DAY_COMMAND_NAME,
	TEST_COMMAND_NAME,
]

export async function registerBotCommands(bot: Bot<MyContext>) {
	await bot.api.setMyCommands([
		dailyBotCommandDescription,
		clearCurrentDayCommandDescription,
	])

	await dailySummaryMenu(bot)
	await startCommand(bot)
	await clearCurrentDayCommand(bot)
	await testCommand(bot)
}
