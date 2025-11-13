const { Scenes } = require('telegraf');
const { backToMainMenu, skipPhotoKeyboard } = require('../keyboards');
const messages = require('../messages');
const { saveUserRequest, trackAction } = require('../database');

const dataCollectionScene = new Scenes.BaseScene('dataCollection');

dataCollectionScene.enter(async (ctx) => {
  ctx.session.userData = {};
  await ctx.reply(messages.dataCollection.name, backToMainMenu());
});

dataCollectionScene.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (text === '🏠 Главное меню') {
    await ctx.scene.leave();
    return ctx.reply(messages.welcome, require('../keyboards').mainMenu());
  }

  if (!ctx.session.userData.name) {
    ctx.session.userData.name = text;
    await ctx.reply(messages.dataCollection.city);
  } else if (!ctx.session.userData.city) {
    ctx.session.userData.city = text;
    await ctx.reply(messages.dataCollection.phone);
  } else if (!ctx.session.userData.phone) {
    ctx.session.userData.phone = text;
    await ctx.reply(messages.dataCollection.brand);
  } else if (!ctx.session.userData.brand) {
    ctx.session.userData.brand = text;
    await ctx.reply(messages.dataCollection.model);
  } else if (!ctx.session.userData.model) {
    ctx.session.userData.model = text;
    await ctx.reply(messages.dataCollection.year);
  } else if (!ctx.session.userData.year) {
    const year = parseInt(text);
    if (isNaN(year)) {
      await ctx.reply(messages.dataCollection.invalidYear);
      return;
    }
    ctx.session.userData.year = year;
    await ctx.reply(messages.dataCollection.systemVersion);
  } else if (!ctx.session.userData.systemVersion) {
    ctx.session.userData.systemVersion = text;
    await ctx.reply(messages.dataCollection.photo, skipPhotoKeyboard());
  } else if (!ctx.session.userData.photoHandled) {
    if (text === 'Пропустить фото') {
      ctx.session.userData.photoUrl = null;
      ctx.session.userData.photoHandled = true;
      await saveAndExit(ctx);
    }
  }
});

dataCollectionScene.on('photo', async (ctx) => {
  if (!ctx.session.userData.photoHandled) {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);
    ctx.session.userData.photoUrl = fileLink.href;
    ctx.session.userData.photoHandled = true;
    await saveAndExit(ctx);
  }
});

async function saveAndExit(ctx) {
  try {
    const requestData = {
      user_id: ctx.from.id,
      name: ctx.session.userData.name,
      city: ctx.session.userData.city,
      phone: ctx.session.userData.phone,
      brand: ctx.session.userData.brand,
      model: ctx.session.userData.model,
      year: ctx.session.userData.year,
      systemVersion: ctx.session.userData.systemVersion,
      photoUrl: ctx.session.userData.photoUrl
    };

    await saveUserRequest(requestData);
    await trackAction(ctx.from.id, 'form_submitted', {
      brand: requestData.brand,
      model: requestData.model,
      year: requestData.year
    });

    await ctx.reply(messages.dataCollection.success, require('../keyboards').mainMenu());
  } catch (error) {
    console.error('Error in data collection:', error);
    await ctx.reply('Произошла ошибка при сохранении. Попробуй позже или свяжись с мастером.', require('../keyboards').mainMenu());
  } finally {
    await ctx.scene.leave();
  }
}

module.exports = dataCollectionScene;
