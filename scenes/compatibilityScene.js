const { Scenes } = require('telegraf');
const { backToMainMenu, yesNoKeyboard } = require('../keyboards');
const messages = require('../messages');
const { findCompatibleCar, trackAction } = require('../database');

const compatibilityScene = new Scenes.BaseScene('compatibility');

compatibilityScene.enter(async (ctx) => {
  ctx.session.compatibilityData = {};
  await trackAction(ctx.from.id, 'compatibility_check_started');
  await ctx.reply(messages.compatibilityCheck.start, backToMainMenu());
});

compatibilityScene.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (text === '🏠 Главное меню') {
    await ctx.scene.leave();
    return ctx.reply(messages.welcome, require('../keyboards').mainMenu());
  }

  if (!ctx.session.compatibilityData.brand) {
    ctx.session.compatibilityData.brand = text;
    await ctx.reply(messages.compatibilityCheck.model);
  } else if (!ctx.session.compatibilityData.model) {
    ctx.session.compatibilityData.model = text;
    await ctx.reply(messages.compatibilityCheck.year);
  } else if (!ctx.session.compatibilityData.year) {
    const year = parseInt(text);
    if (isNaN(year)) {
      await ctx.reply(messages.compatibilityCheck.invalidYear);
      return;
    }

    ctx.session.compatibilityData.year = year;
    
    try {
      const { brand, model, year } = ctx.session.compatibilityData;
      const carData = await findCompatibleCar(brand, model, year);

      await trackAction(ctx.from.id, 'compatibility_checked', {
        brand, model, year, compatible: !!carData
      });

      if (carData) {
        await ctx.reply(messages.compatibilityCheck.compatible(carData), yesNoKeyboard());
      } else {
        await ctx.reply(messages.compatibilityCheck.notCompatible(brand, model, year), backToMainMenu());
        await ctx.scene.leave();
      }
    } catch (error) {
      console.error('Error checking compatibility:', error);
      await ctx.reply('Произошла ошибка при проверке. Попробуй позже или свяжись с мастером.', backToMainMenu());
      await ctx.scene.leave();
    }
  }
});

compatibilityScene.hears('Да', async (ctx) => {
  await ctx.scene.enter('dataCollection');
});

compatibilityScene.hears('Нет', async (ctx) => {
  await ctx.reply('Хорошо! Если будут вопросы - обращайся!', require('../keyboards').mainMenu());
  await ctx.scene.leave();
});

module.exports = compatibilityScene;
