const { Telegraf, Scenes, session } = require('telegraf');
const config = require('./config');
const { mainMenu } = require('./keyboards');
const messages = require('./messages');
const { trackAction, getStatistics } = require('./database');

const compatibilityScene = require('./scenes/compatibilityScene');
const instructionsScene = require('./scenes/instructionsScene');
const dataCollectionScene = require('./scenes/dataCollectionScene');

const bot = new Telegraf(config.botToken);

const stage = new Scenes.Stage([
  compatibilityScene,
  instructionsScene,
  dataCollectionScene,
]);

bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await trackAction(ctx.from.id, 'start');
  await ctx.reply(messages.welcome, mainMenu());
});

bot.hears('🚘 Проверить, подходит ли моя машина', async (ctx) => {
  await ctx.scene.enter('compatibility');
});

bot.hears('⚙️ Инструкция по установке CarPlay', async (ctx) => {
  await ctx.scene.enter('instructions');
});

bot.hears('🗂️ Отправить данные моей машины мастеру', async (ctx) => {
  await ctx.scene.enter('dataCollection');
});

bot.hears('📞 Связаться с мастером', async (ctx) => {
  await trackAction(ctx.from.id, 'contact_master');
  await ctx.reply(messages.contactMaster(), mainMenu());
});

bot.hears('🏠 Главное меню', async (ctx) => {
  await ctx.reply(messages.welcome, mainMenu());
});

bot.command('stats', async (ctx) => {
  if (ctx.from.id.toString() !== config.master.telegramId) {
    return ctx.reply('У тебя нет доступа к этой команде.');
  }

  try {
    const stats = await getStatistics();

    if (!stats) {
      return ctx.reply('Не удалось получить статистику.');
    }

    let modelStats = '';
    for (const [model, count] of Object.entries(stats.by_model)) {
      modelStats += `  ${model}: ${count}\n`;
    }

    const message = `
📊 Статистика бота:

📈 Всего действий: ${stats.requests_total}
📝 Отправлено заявок: ${stats.forms_sent}

🚗 По моделям:
${modelStats || '  Нет данных'}
`;

    await ctx.reply(message);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    await ctx.reply('Ошибка при получении статистики.');
  }
});

bot.on('text', async (ctx) => {
  await ctx.reply(messages.unknownCommand, mainMenu());
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('Произошла ошибка. Попробуй снова или свяжись с мастером.', mainMenu());
});

module.exports = bot;