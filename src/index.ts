import express from 'express';
import { getEnv } from './helpers/env_helper';
import { startDb } from './db/mongodb';

import './helpers/dotenv-loader';
import { telegram_bot } from './controllers/bot.controller';
import { EnvNames } from './enums/env.names';

const app = express();

const HOST = getEnv(EnvNames.HOST);
const PORT = getEnv(EnvNames.PORT) || 3000;

startDb();
telegram_bot();

app.get('/', (req, res) => {
  res.send('<h1>Bot started ⚡️</h1>');
});

app.listen(PORT, () => {
  console.log(`Server started => ${HOST}${PORT} ✅`);
});
