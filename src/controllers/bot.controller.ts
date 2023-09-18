import TelegramBot from 'node-telegram-bot-api';

import { getEnv } from '../helpers/env_helper';
import { EnvNames } from '../enums/env.names';
import { onTextListner } from '../services/onText.service';
import { onContactListner } from '../services/onContact.service';
import { onCallbackDataListner } from '../services/onCallbackData.service';
import { onMessageListner } from '../services/onMessage.service';

const TELEGRAM_API_TOKEN = getEnv(EnvNames.TELEGRAM_API_TOKEN);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TELEGRAM_API_TOKEN!, { polling: true });

export const botController = {
  listenToBotText: () => onTextListner(bot),
  listenToBotContact: () => onContactListner(bot),
  listenToBotMessage: () => onMessageListner(bot),
  listenToBotCallbackData: () => onCallbackDataListner(bot),
};
