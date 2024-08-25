// 实用工具函数，例如权限检查、未授权请求处理等。
const { adminChatId } = require('./config');

function isAdmin(chatId) {
  return chatId === adminChatId;
}

function handleUnauthorizedRequest(bot, chatId) {
  bot.sendMessage(chatId, '权限不足，请联系管理员 @lv_oo_vl');
}

module.exports = {
  isAdmin,
  handleUnauthorizedRequest
};

