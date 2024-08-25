const { isAdmin, handleUnauthorizedRequest } = require('./utils');
const { startMonitoring, stopMonitoring, setHotBuyTask, setHotSellTask, getMonitoringTasks } = require('./monitor');

function setupCommands(bot) {
  bot.onText(/\/startmonitoring(?:\s+(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;

    if (isAdmin(chatId)) {
      const input = match[1];
      if (!input) {
        bot.sendMessage(chatId, `
使用说明：
请使用以下格式来启动监控任务。您可以监控单个币种或多个币种（使用分号隔开）。

格式：
/startmonitoring [币种 价格区间; ...]

示例：
/startmonitoring BNB 500-600
/startmonitoring BNB 500-600; BTC 59000-66000; ETH 2600-2800

在启动监控之前，请确保输入的币种和价格区间正确。
        `);
        return;
      }

      const tasks = input.split(';').map(task => task.trim());
      startMonitoring(bot, tasks);

      bot.sendMessage(chatId, '监控任务已启动。');
    } else {
      handleUnauthorizedRequest(bot, chatId);
    }
  });

  bot.onText(/\/stopmonitoring/, (msg) => {
    const chatId = msg.chat.id;

    if (isAdmin(chatId)) {
      stopMonitoring();
      bot.sendMessage(chatId, '已停止监控。');
    } else {
      handleUnauthorizedRequest(bot, chatId);
    }
  });

  bot.onText(/\/hotbuyprice (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1].trim().split(' ');
    const coin = input[0].toUpperCase();
    const price = parseFloat(input[1]);

    const monitoringTasks = getMonitoringTasks();
    const task = monitoringTasks.find(task => task.coin === coin);

    if (!task) {
      bot.sendMessage(chatId, '监控未开启或币种不在监控列表中。请先启动监控并确保币种在列表中。');
      return;
    }

    setHotBuyTask(coin, price);
    bot.sendMessage(chatId, `正在监控 ${coin} 的价格是否低于或等于 ${price} USDT...`);
  });

  bot.onText(/\/hotsellprice (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const input = match[1].trim().split(' ');
    const coin = input[0].toUpperCase();
    const price = parseFloat(input[1]);

    const monitoringTasks = getMonitoringTasks();
    const task = monitoringTasks.find(task => task.coin === coin);

    if (!task) {
      bot.sendMessage(chatId, '监控未开启或币种不在监控列表中。请先启动监控并确保币种在列表中。');
      return;
    }

    setHotSellTask(coin, price);
    bot.sendMessage(chatId, `正在监控 ${coin} 的价格是否高于或等于 ${price} USDT...`);
  });

  bot.onText(/\/gethelp/, (msg) => {
    const helpMessage = `
使用说明：
以下是可用的 Bot 指令及其详细说明：

1. /startmonitoring [币种 价格区间; ...]
   - 说明：开始监控指定的币种价格区间。
   - 示例：
     /startmonitoring BNB 500-600
     /startmonitoring BNB 500-600; BTC 59000-66000; ETH 2600-2800
   - 备注：可以同时监控多个币种，使用分号隔开。

2. /stopmonitoring
   - 说明：停止当前的监控任务。
   - 示例：/stopmonitoring

3. /hotbuyprice [币种 价格]
   - 说明：当价格低于或等于指定值时，触发买入告警并发送信息及图片。
   - 示例：/hotbuyprice BTC 60000
   - 备注：该操作依赖于现有监控，仅触发一次，如需再次监控需重新输入指令。

4. /hotsellprice [币种 价格]
   - 说明：当价格高于或等于指定值时，触发卖出告警并发送信息及图片。
   - 示例：/hotsellprice BTC 60000
   - 备注：该操作依赖于现有监控，仅触发一次，如需再次监控需重新输入指令。

5. /gethelp
   - 说明：获取此 Bot 的使用详情和说明。

如果您有任何问题，请联系管理员 @lv_oo_vl 进行咨询。
    `;

    bot.sendMessage(msg.chat.id, helpMessage.trim());
  });

  bot.onText(/\/hello/, (msg) => {
    const chatId = msg.chat.id;
    if (isAdmin(chatId)) {
      bot.sendMessage(chatId, '欢迎使用 lisen 机器人');
    } else {
      handleUnauthorizedRequest(bot, chatId);
    }
  });
}

module.exports = {
  setupCommands
};
