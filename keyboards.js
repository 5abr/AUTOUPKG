const { Markup } = require('telegraf');

const mainMenu = () => {
  return Markup.keyboard([
    ['🚘 Проверить, подходит ли моя машина'],
    ['⚙️ Инструкция по установке CarPlay'],
    ['🗂️ Отправить данные моей машины мастеру'],
    ['📞 Связаться с мастером'],
  ]).resize();
};

const backToMainMenu = () => {
  return Markup.keyboard([
    ['🏠 Главное меню'],
  ]).resize();
};

const instructionsMenu = () => {
  return Markup.keyboard([
    ['🔌 Подключение CarPlay по USB'],
    ['📶 Беспроводной CarPlay'],
    ['⚙️ Обновление прошивки'],
    ['🧰 Сброс настроек'],
    ['🏠 Главное меню'],
  ]).resize();
};

const yesNoKeyboard = () => {
  return Markup.keyboard([
    ['Да', 'Нет'],
  ]).resize();
};

const skipPhotoKeyboard = () => {
  return Markup.keyboard([
    ['Пропустить фото'],
  ]).resize();
};

module.exports = {
  mainMenu,
  backToMainMenu,
  instructionsMenu,
  yesNoKeyboard,
  skipPhotoKeyboard,
};
