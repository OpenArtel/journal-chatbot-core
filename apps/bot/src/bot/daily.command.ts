import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { type Bot, InlineKeyboard } from 'grammy'
import type { BotCommand } from 'grammy/types'
import type { Selectable } from 'kysely'
import { db } from '../../infra/database/db'
import type { MastraMessages } from '../../infra/database/generated'
import type { MyContext } from './bot'

type Messages = Pick<Selectable<MastraMessages>, 'id' | 'createdAt'>[]

export const DAILY_COMMAND_NAME = 'days'
const PAGE_SIZE = 7

export const dailyBotCommandDescription: BotCommand = {
	command: DAILY_COMMAND_NAME,
	description: 'Получить итоги дней',
}

const CALLBACKS = {
	page: (offset: number) => `list:page:${offset}`,
	item: (id: string, offset: number) => `list:item:${id}:${offset}`,
	PAGE_REGEX: /^list:page:(\d+)$/,
	ITEM_REGEX: /^list:item:([0-9a-f-]{36}):(\d+)$/i,
} as const

function formatDate(date: Date) {
	return format(date, 'd MMMM yyyy', { locale: ru })
}

async function fetchPageData(offset: number, userId: string) {
	const rows = await db
		.selectFrom('mastra_messages')
		.select(['id', 'createdAt'])
		.where('resourceId', '=', userId)
		.where('thread_id', '=', `daily-${userId}`)
		.select(({ fn }) => fn.countAll().over().as('total_count'))
		.orderBy('createdAt', 'desc')
		.offset(offset)
		.limit(PAGE_SIZE)
		.execute()

	const total = rows[0]?.total_count ?? 0
	return {
		items: rows as Messages,
		total: Number(total),
	}
}

function getLastOffset(total: number) {
	if (total <= 0) return 0
	return Math.floor((total - 1) / PAGE_SIZE) * PAGE_SIZE
}

function renderHeaderFromData(total: number, offset: number) {
	if (total === 0) {
		return `Итоги дня не найдены, они подводятся автоматически ночью`
	}

	const currentPage = Math.ceil((offset + 1) / PAGE_SIZE)
	const lastPage = Math.ceil(total / PAGE_SIZE)

	const isOnlyOnePage = lastPage === 1
	if (isOnlyOnePage) return 'Список ваших итогов дня'

	return [
		'Список ваших итогов дня',
		'',
		isOnlyOnePage ? '' : `Страница ${currentPage} из ${lastPage}`,
	].join('\n')
}

function buildListKeyboardFromData(
	items: Messages,
	total: number,
	offset: number,
) {
	const kb = new InlineKeyboard()

	for (const item of items) {
		kb.text(formatDate(item.createdAt), CALLBACKS.item(item.id, offset)).row()
	}

	if (total <= PAGE_SIZE) return kb

	const lastOffset = getLastOffset(total)
	const prev = Math.max(0, offset - PAGE_SIZE)
	const next = Math.min(lastOffset, offset + PAGE_SIZE)

	const hasPrev = offset > 0
	const hasNext = offset < lastOffset

	if (hasPrev) kb.text('⬅️ Назад', CALLBACKS.page(prev))
	if (hasNext) kb.text('Вперёд ➡️', CALLBACKS.page(next))

	return kb
}

function buildBackToListKeyboard(offset: number) {
	return new InlineKeyboard().text('⬅️ Назад', CALLBACKS.page(offset))
}

export async function dailySummaryMenu(bot: Bot<MyContext>) {
	bot.command(DAILY_COMMAND_NAME, async (ctx) => {
		if (!ctx.from) return
		const userId = String(ctx.from.id)
		const { items, total } = await fetchPageData(0, userId)
		await ctx.reply(renderHeaderFromData(total, 0), {
			reply_markup: buildListKeyboardFromData(items, total, 0),
		})
	})

	bot.callbackQuery(CALLBACKS.PAGE_REGEX, async (ctx) => {
		if (!ctx.from) return
		const userId = String(ctx.from.id)

		const offset = Number(ctx.match[1] ?? 0)
		await ctx.answerCallbackQuery()

		const { items, total } = await fetchPageData(offset, userId)

		// Если offset оказался невалидным
		if (items.length === 0 && offset > 0) {
			const prev = Math.max(0, offset - PAGE_SIZE)

			await ctx.editMessageText(
				`Эта страница устарела, список мог измениться`,
				{
					reply_markup: new InlineKeyboard()
						.text('⬅️ Назад', CALLBACKS.page(prev))
						.text('К началу', CALLBACKS.page(0)),
				},
			)
			return
		}

		await ctx.editMessageText(renderHeaderFromData(total, offset), {
			reply_markup: buildListKeyboardFromData(items, total, offset),
		})
	})

	bot.callbackQuery(CALLBACKS.ITEM_REGEX, async (ctx) => {
		const id = ctx.match[1] as string // regex ensures this is a valid UUID
		const backOffset = Number(ctx.match[2] ?? 0)

		await ctx.answerCallbackQuery()

		const item = await db
			.selectFrom('mastra_messages')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst()

		if (!item) {
			await ctx.editMessageText('Элемент не найден или был удалён', {
				reply_markup: buildBackToListKeyboard(backOffset),
			})
			return
		}

		// на самом деле это json в mastra ai
		const message = JSON.parse(item.content).content

		await ctx.editMessageText(
			[formatDate(item.createdAt), '', 'Итоги:', message].join('\n'),
			{ reply_markup: buildBackToListKeyboard(backOffset) },
		)
	})
}
