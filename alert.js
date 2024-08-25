const fs = require('fs');
const { adminChatId } = require('./config');

function sendHotAlert(bot, type, coin, price, task, currentDateTime) {
  const message = `
已为您查询到匹配内容:

${coin} ${type === 'buy' ? '买入' : '卖出'}告警
日期,时间: ${currentDateTime}
当前价格: ${price} USDT
${task ? `最高价格: ${task.highestPrice} USDT\n最低价格: ${task.lowestPrice} USDT\n监控区间: ${task.low}-${task.high} USDT` : ''}
  `;

  const image = type === 'buy' ? './assets/hotbuy.webp' : './assets/hotsell.webp';

  bot.sendMessage(adminChatId, message.trim());
  bot.sendPhoto(adminChatId, fs.createReadStream(image));
}

module.exports = {
  sendHotAlert
};
