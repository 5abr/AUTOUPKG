const { Scenes } = require('telegraf');
const { instructionsMenu, backToMainMenu } = require('../keyboards');
const messages = require('../messages');
const { trackAction } = require('../database');

const instructionsScene = new Scenes.BaseScene('instructions');

instructionsScene.enter(async (ctx) => {
  await trackAction(ctx.from.id, 'instructions_opened');
  await ctx.reply(messages.instructions.menu, instructionsMenu());
});

instructionsScene.hears('🔌 Подключение CarPlay по USB', async (ctx) => {
  await trackAction(ctx.from.id, 'instruction_usb');
  await ctx.reply(messages.instructions.usb, instructionsMenu());
});

instructionsScene.hears('📶 Беспроводной CarPlay', async (ctx) => {
  await trackAction(ctx.from.id, 'instruction_wireless');
  await ctx.reply(messages.instructions.wireless, instructionsMenu());
});

instructionsScene.hears('⚙️ Обновление прошивки', async (ctx) => {
  await trackAction(ctx.from.id, 'instruction_firmware');
  await ctx.reply(messages.instructions.firmware, instructionsMenu());
});

instructionsScene.hears('🧰 Сброс настроек', async (ctx) => {
  await trackAction(ctx.from.id, 'instruction_reset');
  await ctx.reply(messages.instructions.reset, instructionsMenu());
});

instructionsScene.hears('🏠 Главное меню', async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply(messages.welcome, require('../keyboards').mainMenu());
});

instructionsScene.on('text', async (ctx) => {
  await ctx.reply('Используй кнопки меню для выбора инструкции 📚', instructionsMenu());
});

module.exports = instructionsScene;
