import express from 'express';
import { getEnv } from './helpers/envHelper';
import { startDb } from './db/mongodb';

import './helpers/dotenvLoader';
import { botController } from './controllers/bot.controller';
import { EnvNames } from './enums/env.names';
import { clearDbCron } from './helpers/cron';

const app = express();

const HOST = getEnv(EnvNames.HOST);
const PORT = getEnv(EnvNames.PORT) || 3000;

startDb();

try {
  botController.listenToBotText();
  botController.listenToBotContact();
  botController.listenToBotMessage();
  botController.listenToBotCallbackData();

  console.log('Bot started => ✅');

  clearDbCron.start();
} catch (error) {
  console.error(error);
}

app.get('/', (req, res) => {
  res.send('<h1>Bot started ⚡️</h1>');
});

app.listen(PORT, () => {
  console.log(`Server started => ${HOST}${PORT} ✅`);
});
