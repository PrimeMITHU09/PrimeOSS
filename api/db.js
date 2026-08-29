const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

function isConfigured() {
  return supabase !== null;
}

// User Helpers
async function saveUser(userId, firstName, username) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        user_id: userId,
        first_name: firstName,
        username: username,
        last_active: new Date().toISOString()
      }, { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase saveUser error:', err.message);
    return null;
  }
}

async function getAllUsers() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getAllUsers error:', err.message);
    return null;
  }
}

// Order Helpers
async function createOrder(orderData) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.userId,
        name: orderData.name,
        username: orderData.username,
        package_name: orderData.packageName,
        method: orderData.method,
        proof: orderData.proof,
        status: 'Pending Verification',
        price_paid: orderData.pricePaid || 30
      });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase createOrder error:', err.message);
    return null;
  }
}

async function getUserOrders(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getUserOrders error:', err.message);
    return null;
  }
}

async function clearUserOrders(userId) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase clearUserOrders error:', err.message);
    return null;
  }
}

async function getPendingOrders() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Pending Verification')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getPendingOrders error:', err.message);
    return null;
  }
}

async function getOrderForUser(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Pending Verification')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase getOrderForUser error:', err.message);
    return null;
  }
}

async function updateOrderStatus(userId, status, customEmail, customPass) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('orders')
      .update({
        status: status,
        custom_email: customEmail,
        custom_pass: customPass
      })
      .eq('user_id', userId)
      .eq('status', 'Pending Verification');
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase updateOrderStatus error:', err.message);
    return null;
  }
}

async function updateOrderLoginCode(userId, loginCode) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ login_code: loginCode })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase updateOrderLoginCode error:', err.message);
    return null;
  }
}

async function cancelOrder(userId) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('user_id', userId)
      .eq('status', 'Pending Verification');
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase cancelOrder error:', err.message);
    return null;
  }
}

async function getSalesReport() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'Completed');
    if (error) throw error;

    let totalCount = data.length;
    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    data.forEach(ord => {
      const price = (ord.price_paid !== undefined && ord.price_paid !== null) ? ord.price_paid : 30;
      totalRevenue += price;

      const orderDate = new Date(ord.created_at);
      if (orderDate >= startOfToday) {
        todayRevenue += price;
      }
      if (orderDate >= startOfMonth) {
        monthRevenue += price;
      }
    });

    return { totalCount, totalRevenue, todayRevenue, monthRevenue };
  } catch (err) {
    console.error('Supabase getSalesReport error:', err.message);
    return null;
  }
}

// Coupon Helpers
async function getCoupon(code) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase getCoupon error:', err.message);
    return null;
  }
}

async function createCoupon(code, discountAmount) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .upsert({
        code: code.toUpperCase(),
        discount_amount: parseInt(discountAmount)
      }, { onConflict: 'code' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase createCoupon error:', err.message);
    return null;
  }
}

async function deleteCoupon(code) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('code', code.toUpperCase());
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase deleteCoupon error:', err.message);
    return null;
  }
}

async function getAllCoupons() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Supabase getAllCoupons error:', err.message);
    return null;
  }
}

// User Session Helpers
async function getUserSession(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase getUserSession error:', err.message);
    return null;
  }
}

async function updateUserSession(userId, updateData) {
  if (!supabase) return null;
  try {
    // Map to snake_case database columns
    const dbData = { user_id: userId };
    if (updateData.method !== undefined) dbData.method = updateData.method;
    if (updateData.waitingFor !== undefined) dbData.waiting_for = updateData.waitingFor;
    if (updateData.proof !== undefined) dbData.proof = updateData.proof;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('user_sessions')
      .upsert(dbData, { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase updateUserSession error:', err.message);
    return null;
  }
}

// Admin Session Helpers
async function getAdminSession(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('user_id', userId)
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Supabase getAdminSession error:', err.message);
    return null;
  }
}

async function updateAdminSession(userId, updateData) {
  if (!supabase) return null;
  try {
    const dbData = { user_id: userId };
    if (updateData.step !== undefined) dbData.step = updateData.step;
    if (updateData.targetUserId !== undefined) dbData.target_user_id = updateData.targetUserId;
    if (updateData.customEmail !== undefined) dbData.custom_email = updateData.customEmail;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('admin_sessions')
      .upsert(dbData, { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase updateAdminSession error:', err.message);
    return null;
  }
}

async function clearAdminSession(userId) {
  if (!supabase) return null;
  try {
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Supabase clearAdminSession error:', err.message);
    return null;
  }
}

module.exports = {
  isConfigured,
  saveUser,
  getAllUsers,
  createOrder,
  getUserOrders,
  clearUserOrders,
  getPendingOrders,
  getOrderForUser,
  updateOrderStatus,
  updateOrderLoginCode,
  cancelOrder,
  getSalesReport,
  getCoupon,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getUserSession,
  updateUserSession,
  getAdminSession,
  updateAdminSession,
  clearAdminSession
};
