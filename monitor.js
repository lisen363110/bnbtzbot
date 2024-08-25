const cron = require('node-cron');
const axios = require('axios');
const { groupChatId, adminChatId } = require('./config');
const { sendHotAlert } = require('./alert');

let monitoringTasks = [];
let hotBuyTask = null;   // 用于存储 /hotbuyprice 条件
let hotSellTask = null;  // 用于存储 /hotsellprice 条件
let cronJob = null;

function startMonitoring(bot, tasks) {
  monitoringTasks = tasks.map(task => {
    const [coin, range] = task.split(' ');
    const [low, high] = range.split('-').map(Number);

    return {
      coin: coin.toUpperCase(),
      low,
      high,
      lastPrice: null,
      highestPrice: low,
      lowestPrice: high
    };
  });

  console.log('All monitoring tasks:', monitoringTasks);

  if (cronJob) cronJob.stop();
  cronJob = cron.schedule('*/30 * * * * *', () => fetchPrices(bot));
  cronJob.start();
}

function stopMonitoring() {
  if (cronJob) cronJob.stop();
  cronJob = null;
  monitoringTasks = []; 
  hotBuyTask = null;  
  hotSellTask = null; 
}

async function fetchPrices(bot) {
  if (monitoringTasks.length === 0) return;

  try {
    const symbols = monitoringTasks.map(task => task.coin + 'USDT').join(',');
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
      params: { symbols: `["${symbols.split(',').join('","')}"]` }
    });

    response.data.forEach(item => {
      const coin = item.symbol.replace('USDT', '');
      const price = parseFloat(item.price);

      const task = monitoringTasks.find(task => task.coin === coin);

      if (task) {
        if (price > task.highestPrice) task.highestPrice = price;
        if (price < task.lowestPrice) task.lowestPrice = price;

        if (price !== task.lastPrice) {
          const alertLevel = getAlertLevel(price, task.low, task.high);
          const currentDateTime = new Date().toLocaleString();
          const message = `
${coin} 告警级别: ${alertLevel}
日期,时间: ${currentDateTime}
当前价格: ${price} USDT
最高价格: ${task.highestPrice} USDT
最低价格: ${task.lowestPrice} USDT
监控区间: ${task.low}-${task.high} USDT
          `;

          bot.sendMessage(groupChatId, message.trim());

          if (alertLevel === '灾难告警') {
            bot.sendMessage(adminChatId, message.trim());
          }

          // 检查 HotBuy 和 HotSell 条件
          if (hotBuyTask && coin === hotBuyTask.coin && price <= hotBuyTask.price) {
            sendHotAlert(bot, 'buy', coin, price, task, currentDateTime);
            hotBuyTask = null; // 仅触发一次
          }

          if (hotSellTask && coin === hotSellTask.coin && price >= hotSellTask.price) {
            sendHotAlert(bot, 'sell', coin, price, task, currentDateTime);
            hotSellTask = null; // 仅触发一次
          }

          task.lastPrice = price;
        }
      }
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
  }
}

function getAlertLevel(price, low, high) {
  const range = high - low;
  const levels = [
    { level: '灾难告警', min: -Infinity, max: low },
    { level: '紧急告警', min: low, max: low + 0.2 * range },
    { level: '重要告警', min: low + 0.2 * range, max: low + 0.4 * range },
    { level: '警告告警', min: low + 0.4 * range, max: low + 0.6 * range },
    { level: '普通提示', min: low + 0.6 * range, max: Infinity }
  ];

  return levels.find(l => price >= l.min && price < l.max).level;
}

function setHotBuyTask(coin, price) {
  hotBuyTask = { coin, price };
}

function setHotSellTask(coin, price) {
  hotSellTask = { coin, price };
}

function getMonitoringTasks() {
  return monitoringTasks;
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  fetchPrices,
  setHotBuyTask,
  setHotSellTask,
  getMonitoringTasks
};
