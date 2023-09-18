import { CronJob } from 'cron';
import * as os from 'os';
import * as fs from 'fs';
import { orderModel } from '../models/order.model';
import { simpleDate } from './dateHelpers';

// Cron job format
// * * * * * *
// | | | | | |
// | | | | | day of week
// | | | | month
// | | | day of month
// | | hour
// | minute
// second ( optional )

const clearDbCron = new CronJob('0 0 * * 0', async () => {
  console.log('\x1b[41m', 'Cron job started', '\x1b[0m');

  // remove orders from db older than 1 week
  const deletedCount = await orderModel.removeOldOrders({
    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  });

  // get server details
  let heap = process.memoryUsage().heapUsed / 1024 / 1024;
  let date = new Date().toISOString();
  const freeMemory = Math.round((os.freemem() * 100) / os.totalmem()) + '%';

  // format server details
  let csv = `
------------ ${simpleDate(new Date(date))} ---------------
Removed orders: ${deletedCount}

Heap: ${heap}
Free Memory: ${freeMemory}
Memory usage: ${process.memoryUsage().heapUsed / 1024 / 1024} MB
CPU: ${os.cpus().length} cores
Platform: ${os.platform()}
Hostname: ${os.hostname()}
Home dir: ${os.homedir()}
Arch: ${os.arch()}
User info: ${JSON.stringify(os.userInfo())}`;

  // storing log In .csv file
  fs.appendFile('reports/cronReports.csv', csv, function (err) {
    if (err) throw err;
    console.error('Server details logged!');
  });

  console.log('\x1b[42m', 'Cron job finished', '\x1b[0m');
});

export { clearDbCron };
