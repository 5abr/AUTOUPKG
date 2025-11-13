const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

async function getCarModels() {
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .order('brand', { ascending: true });

  if (error) {
    console.error('Error getting car models:', error);
    return [];
  }
  return data || [];
}

async function findCompatibleCar(brand, model, year) {
  const { data, error } = await supabase
    .from('car_models')
    .select('*')
    .ilike('brand', `%${brand}%`)
    .ilike('model', `%${model}%`);

  if (error) {
    console.error('Error finding compatible car:', error);
    return null;
  }

  if (data && data.length > 0) {
    const car = data[0];
    // Проверяем, входит ли год в диапазон
    if (car.years && car.years.includes(parseInt(year))) {
      return car;
    }
  }

  return null;
}

async function saveUserRequest(requestData) {
  console.log('Saving request data:', {
    user_id: requestData.user_id,
    user_name: requestData.name,
    user_city: requestData.city,      // ← исправлено с city на user_city
    user_phone: requestData.phone,    // ← исправлено с phone на user_phone
    car_brand: requestData.brand,
    car_model: requestData.model,
    car_year: requestData.year,
    system_version: requestData.systemVersion,
    photo_url: requestData.photoUrl
  });

  const { data, error } = await supabase
    .from('user_requests')
    .insert([{
      user_id: requestData.user_id,
      user_name: requestData.name,
      user_city: requestData.city,      // ← исправлено
      user_phone: requestData.phone,    // ← исправлено  
      car_brand: requestData.brand,
      car_model: requestData.model,
      car_year: requestData.year,
      system_version: requestData.systemVersion,
      photo_url: requestData.photoUrl
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving request:', error);
    throw error;
  }
  
  console.log('Request saved successfully:', data);
  return data;
}

async function trackAction(userId, actionType, carInfo = null) {
  const { error } = await supabase
    .from('bot_statistics')
    .insert([{
      user_id: userId,
      action_type: actionType,
      car_info: carInfo,
    }]);

  if (error) console.error('Error tracking action:', error);
}

async function getStatistics() {
  try {
    const { data: stats, error: statsError } = await supabase
      .from('bot_statistics')
      .select('action_type, car_info, created_at');

    const { data: requests, error: requestsError } = await supabase
      .from('user_requests')
      .select('car_brand, car_model, created_at');

    if (statsError || requestsError) {
      console.error('Error fetching statistics:', statsError || requestsError);
      return null;
    }

    const byModel = {};
    requests.forEach(req => {
      const key = `${req.car_brand} ${req.car_model}`;
      byModel[key] = (byModel[key] || 0) + 1;
    });

    return {
      requests_total: stats.length,
      by_model: byModel,
      forms_sent: requests.length,
    };
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return null;
  }
}

module.exports = {
  supabase,
  getCarModels,
  findCompatibleCar,
  saveUserRequest,
  trackAction,
  getStatistics,
};