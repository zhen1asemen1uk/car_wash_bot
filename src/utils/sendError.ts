import TelegramBot from 'node-telegram-bot-api';
import { kbrds } from './keyboards';
import { TriggersBot } from '../enums/triggers.bot';

const defaultErrorMessage = TriggersBot.SOMETHING_WENT_WRONG;
const defaultErrorButtons = kbrds.orders.ordersMenu;

interface ISendError {
  bot: TelegramBot;
  error: any;
  chatId: number;
  inlineBoard?: boolean;
  errMessage?: string;
  arrBtns?: { text: string }[][];
}
export const sendError = async ({
  bot,
  error,
  chatId,
  inlineBoard = false,
  errMessage = defaultErrorMessage,
  arrBtns = defaultErrorButtons,
}: ISendError) => {
  console.error(error);

  return await bot.sendMessage(
    chatId,
    errMessage,
    inlineBoard
      ? { reply_markup: { inline_keyboard: arrBtns } }
      : { reply_markup: { keyboard: arrBtns } },
  );
};
