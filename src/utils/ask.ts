import TelegramBot from 'node-telegram-bot-api';
import { IAnswers, IQuestion } from '../types/types';
import { toTranslit } from './toTranslit';

export const ask = async ({
  bot,
  chatId,
  questions,
}: {
  bot: TelegramBot;
  chatId: number;
  questions: IQuestion[];
}) => {
  const answers: IAnswers = {};

  // move out to utils
  for (const { key, question } of questions) {
    await bot.sendMessage(chatId, question, {
      reply_markup: { remove_keyboard: true },
    });

    const answer = await new Promise<string>(resolve => {
      bot.once('message', msg => {
        if (msg.text) {
          resolve(toTranslit(msg.text.toLowerCase().replace(/\s/g, '_')));
        } else {
          resolve('');
        }
      });
    });

    answers[key] = answer;
  }

  return answers;
};
