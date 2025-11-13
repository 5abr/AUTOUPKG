// Сначала проверяем конфигурацию
const config = require('./config');

console.log('🔍 Проверка конфигурации:');
console.log('Supabase URL:', config.supabase.url ? '✅' : '❌');
console.log('Bot Token:', config.botToken ? '✅' : '❌');
console.log('Master Telegram ID:', config.master.telegramId ? '✅' : '❌');

if (!config.botToken) {
  console.error('❌ Ошибка: BOT_TOKEN не найден в переменных окружения');
  process.exit(1);
}

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.error('❌ Ошибка: Отсутствуют переменные Supabase');
  process.exit(1);
}

// Затем запускаем бота
const bot = require('./bot');

console.log('🚀 Запуск CarPlay бота...');

bot.launch()
  .then(() => {
    console.log('✅ Бот успешно запущен!');
  })
  .catch((error) => {
    console.error('❌ Ошибка запуска бота:', error);
    process.exit(1);
  });

process.once('SIGINT', () => {
  console.log('Остановка бота...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('Остановка бота...');
  bot.stop('SIGTERM');
});