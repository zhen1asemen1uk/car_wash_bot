import TelegramBot from 'node-telegram-bot-api';
import { TriggersBot } from '../enums/triggers.bot';
import { kbrds } from './keyboards';

export const sendMessageInParts = async (bot: TelegramBot, chatId: number, message: string) => {
  const maxMessageLength = 4096; // maximum message length in Telegram

  for (let i = 0; i < message.length; i += maxMessageLength) {
    const currentPart = message.substring(i, i + maxMessageLength);

    await bot.sendMessage(chatId, currentPart, {
      reply_markup: {
        keyboard: kbrds.service.goMain,
      },
    });
  }
};
