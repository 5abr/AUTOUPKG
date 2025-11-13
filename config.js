require('dotenv').config();

module.exports = {
  botToken: process.env.BOT_TOKEN,
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  master: {
    telegramId: process.env.MASTER_TELEGRAM_ID,
    username: process.env.MASTER_USERNAME,
    phones: [process.env.MASTER_PHONE_1, process.env.MASTER_PHONE_2],
  },
};
