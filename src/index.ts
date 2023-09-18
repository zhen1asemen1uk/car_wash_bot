import express from 'express';
import { getEnv } from './helpers/env_helper';
import { startDb } from './db/mongodb';

import './helpers/dotenv-loader';
import { botController } from './controllers/bot.controller';
import { EnvNames } from './enums/env.names';

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
} catch (error) {
  console.error(error);
}

app.get('/', (req, res) => {
  res.send('<h1>Bot started ⚡️</h1>');
});

app.listen(PORT, () => {
  console.log(`Server started => ${HOST}${PORT} ✅`);
});
