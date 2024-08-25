const TelegramBot = require('node-telegram-bot-api');
const { botToken } = require('./config');
const { setupCommands } = require('./commands');

// 初始化 Telegram Bot
const bot = new TelegramBot(botToken, { polling: true });

// 设置命令
setupCommands(bot);

// 设置命令列表
bot.setMyCommands([
  { command: '/startmonitoring', description: '开始监控指定的币种价格区间' },
  { command: '/stopmonitoring', description: '结束当前的监控任务' },
  { command: '/hotbuyprice', description: '设置买入警告的币种和价格' },
  { command: '/hotsellprice', description: '设置卖出警告的币种和价格' },
  { command: '/gethelp', description: '获取Bot的使用详情' },
]);

// 捕捉未识别指令的错误
bot.on('polling_error', (error) => {
  console.error(`Polling error:`, error.code, error.response?.body);
});

console.log('Crypto Price Monitoring Bot is running...');
