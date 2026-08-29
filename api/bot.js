require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const db = require('./db');

const BOT_TOKEN = process.env.BOT_TOKEN || '8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc';
const ADMIN_ID = (process.env.ADMIN_ID || '1262396547').toString();
const GROUP_ID = process.env.GROUP_ID || '-5569242233';

const bot = new Telegraf(BOT_TOKEN);

// Fallback in-memory objects in case Supabase is not configured
const memoryUserSession = {};
const memoryPendingOrders = {}; 
const memoryAllStartedUsers = new Set(); 
const memoryUserOrderHistory = {}; 
const memoryAdminSession = {};
const memoryCoupons = {
    'WELCOME10': 10,
    'SPECIAL20': 20
};

function isAdmin(ctx) {
    if (!ctx.from) return false;
    const userId = ctx.from.id.toString();
    return userId === ADMIN_ID;
}

// Database / Memory Data Access Layer Helpers with custom encoding inside the "method" column
async function saveUser(ctx) {
    if (!ctx.from) return;
    const userId = ctx.from.id.toString();
    const firstName = ctx.from.first_name || 'User';
    const username = ctx.from.username || '';

    if (db.isConfigured()) {
        const result = await db.saveUser(userId, firstName, username);
        if (result !== null) return;
    }
    memoryAllStartedUsers.add(userId);
}

async function getUserSession(userId) {
    if (db.isConfigured()) {
        const session = await db.getUserSession(userId);
        if (session !== null) {
            // Parse custom encoded method: "methodName|packageName|price|appliedCoupon|discount"
            const parts = session.method ? session.method.split('|') : [];
            const method = parts[0] || null;
            const packageName = parts[1] || '1 Account AdsPower';
            const price = parseInt(parts[2]) || 30;
            const appliedCoupon = parts[3] || null;
            const discount = parseInt(parts[4]) || 0;
            return {
                userId: session.user_id,
                method: method,
                packageName: packageName,
                price: price,
                appliedCoupon: appliedCoupon,
                discount: discount,
                waitingFor: session.waiting_for,
                proof: session.proof
            };
        }
    }
    if (!memoryUserSession[userId]) {
        memoryUserSession[userId] = { userId, method: null, packageName: '1 Account AdsPower', price: 30, appliedCoupon: null, discount: 0, waitingFor: null, proof: null };
    }
    return memoryUserSession[userId];
}

async function updateUserSession(userId, updateData) {
    const current = await getUserSession(userId);
    const merged = { ...current, ...updateData };

    if (db.isConfigured()) {
        // Encode method, packageName, price, appliedCoupon, and discount together into the "method" column
        const encodedMethod = `${merged.method || ''}|${merged.packageName || '1 Account AdsPower'}|${merged.price || 30}|${merged.appliedCoupon || ''}|${merged.discount || 0}`;
        const dbUpdate = {
            method: encodedMethod,
            waitingFor: merged.waitingFor,
            proof: merged.proof
        };
        const result = await db.updateUserSession(userId, dbUpdate);
        if (result !== null) return;
    }
    
    if (!memoryUserSession[userId]) {
        memoryUserSession[userId] = { userId, method: null, packageName: '1 Account AdsPower', price: 30, appliedCoupon: null, discount: 0, waitingFor: null, proof: null };
    }
    Object.assign(memoryUserSession[userId], updateData);
}

async function getAdminSession(userId) {
    if (db.isConfigured()) {
        const session = await db.getAdminSession(userId);
        if (session !== null) {
            const parts = session.step ? session.step.split('|') : [];
            const step = parts[0] || null;
            const extraData = parts[1] || null;
            return {
                userId: session.user_id,
                step: step,
                extraData: extraData,
                targetUserId: session.target_user_id,
                customEmail: session.custom_email
            };
        }
    }
    return memoryAdminSession[userId] || null;
}

async function updateAdminSession(userId, updateData) {
    if (db.isConfigured()) {
        let stepVal = updateData.step || '';
        if (updateData.extraData) {
            stepVal = `${stepVal}|${updateData.extraData}`;
        }
        const dbUpdate = {
            step: stepVal,
            targetUserId: updateData.targetUserId,
            customEmail: updateData.customEmail
        };
        const result = await db.updateAdminSession(userId, dbUpdate);
        if (result !== null) return;
    }
    if (!memoryAdminSession[userId]) {
        memoryAdminSession[userId] = { userId, step: null, extraData: null, targetUserId: null, customEmail: null };
    }
    Object.assign(memoryAdminSession[userId], updateData);
}

async function clearAdminSession(userId) {
    if (db.isConfigured()) {
        const result = await db.clearAdminSession(userId);
        if (result !== null) return;
    }
    delete memoryAdminSession[userId];
}

async function getUserOrders(userId) {
    if (db.isConfigured()) {
        const orders = await db.getUserOrders(userId);
        if (orders !== null) {
            return orders.map(ord => ({
                packageName: ord.package_name,
                method: ord.method,
                status: ord.status,
                customEmail: ord.custom_email,
                customPass: ord.custom_pass,
                loginCode: ord.login_code,
                createdAt: ord.created_at
            }));
        }
    }
    return memoryUserOrderHistory[userId] || [];
}

async function clearUserOrders(userId) {
    if (db.isConfigured()) {
        const result = await db.clearUserOrders(userId);
        if (result !== null) return;
    }
    memoryUserOrderHistory[userId] = [];
}

async function getPendingOrders() {
    if (db.isConfigured()) {
        const orders = await db.getPendingOrders();
        if (orders !== null) {
            return orders.map(ord => ({
                name: ord.name,
                method: ord.method ? ord.method.split('|')[0] : 'Unknown', // decode method
                userId: ord.user_id
            }));
        }
    }
    return Object.values(memoryPendingOrders).filter(o => o.status === 'Pending Verification');
}

async function getOrderForUser(userId) {
    if (db.isConfigured()) {
        const ord = await db.getOrderForUser(userId);
        if (ord !== null) {
            return {
                name: ord.name,
                username: ord.username,
                userId: ord.user_id,
                method: ord.method ? ord.method.split('|')[0] : 'Unknown', // decode method
                proof: ord.proof,
                status: ord.status
            };
        }
    }
    return memoryPendingOrders[userId] || null;
}

async function rejectOrderDB(userId) {
    if (db.isConfigured()) {
        const result = await db.updateOrderStatus(userId, 'Rejected', null, null);
        if (result !== null) return;
    }
    if (memoryPendingOrders[userId]) {
        memoryPendingOrders[userId].status = 'Rejected';
        delete memoryPendingOrders[userId];
    }
}

async function getSalesReportStats() {
    if (db.isConfigured()) {
        const stats = await db.getSalesReport();
        if (stats !== null) return stats;
    }
    
    // Memory fallback calculation
    let totalCount = 0;
    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthRevenue = 0;
    
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const allMemoryOrders = [];
    Object.keys(memoryUserOrderHistory).forEach(uid => {
        memoryUserOrderHistory[uid].forEach(ord => {
            if (ord.status === 'Completed') {
                allMemoryOrders.push(ord);
            }
        });
    });
    
    allMemoryOrders.forEach(ord => {
        totalCount++;
        totalRevenue += 30; // default 30 TK
        const orderDate = new Date(ord.createdAt || now);
        if (orderDate >= startOfToday) {
            todayRevenue += 30;
        }
        if (orderDate >= startOfMonth) {
            monthRevenue += 30;
        }
    });
    
    return { totalCount, totalRevenue, todayRevenue, monthRevenue };
}

async function getUserIdsForBroadcast() {
    if (db.isConfigured()) {
        const users = await db.getAllUsers();
        if (users !== null) {
            return users.map(u => u.user_id);
        }
    }
    return Array.from(memoryAllStartedUsers);
}

// Reusable menu component with FAQ integrated
function getMainMenu(userName) {
    return {
        text: `⭐ *AdsPower Seller BD*\n\n` +
              `🚀 *স্বাগতম ${userName}! আপনি আমাদের লাকি কাস্টমার!* \n\n` +
              "Unlock Ultimate Multi-Accounting Security & Speed!\n" +
              "নিচের বাটনগুলো থেকে আপনার প্রয়োজনীয় অপশনটি সিলেক্ট করুন:",
        extra: {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📦 AdsPower Details', 'details')],
                [Markup.button.callback('🛒 Buy Now', 'buy_options')],
                [Markup.button.callback('👤 My Profile', 'profile'), Markup.button.callback('🛍 My Order', 'my_order')],
                [Markup.button.callback('🧾 Transaction', 'transaction'), Markup.button.callback('❓ FAQ & Help Guide', 'faq_menu')],
                [Markup.button.callback('📞 Contact Support', 'support')]
            ])
        }
    };
}

const adminReplyKeyboard = Markup.keyboard([
    ['⭐ 📦 Pending Orders ⭐', '⭐ 👥 Total Bot Users ⭐'],
    ['📢 Broadcast 📢', '📊 Sales Report 📊'],
    ['🎟️ Coupons 🎟️', '👑 Close Admin Panel 👑']
]).resize();

// /start কমান্ড
bot.start(async (ctx) => {
    await saveUser(ctx);
    const userName = ctx.from.first_name || "User";
    const menu = getMainMenu(userName);
    return ctx.reply(menu.text, menu.extra);
});

// Inline Action: Main Menu (Back navigation handler)
bot.action('main_menu', async (ctx) => {
    await ctx.answerCbQuery();
    const userName = ctx.from.first_name || "User";
    const menu = getMainMenu(userName);
    try {
        await ctx.editMessageText(menu.text, menu.extra);
    } catch (e) {
        await ctx.reply(menu.text, menu.extra);
    }
});

// AdsPower Details with Close/OK button & Back button
bot.action('details', async (ctx) => {
    await ctx.answerCbQuery();
    const detailsText = 
        `🚀 *AdsPower Antidetect Browser - 10 Days Premium Pass*\n\n` +
        `Unlock Ultimate Multi-Accounting Security & Speed!\n` +
        `আপনি কি Facebook, TikTok, E-commerce, Affiliate Marketing বা Cpa Marketing-এর জন্য একাধিক অ্যাকাউন্ট ম্যানেজ করতে গিয়ে ব্যান বা রেস্ট্রিকশনের সমস্যায় পড়ছেন?\n\n` +
        `আজই নিন AdsPower 10-Days Premium Access এবং আপনার অনলাইন বিজনেসকে নিয়ে যান অন্য লেভেলে!\n\n` +
        `> 🌟 *10-Din-er Trial / Package-e Ja Ja Benefits Pacchen*\n\n` +
        `🔒 *Advanced Fingerprint Protection:* প্রতিটি ব্রাউজার প্রোফাইলের জন্য আলাদা Real Canvas, WebGL, Audio, and Hardware Fingerprint—যাতে ফেসবুক বা অন্য প্ল্যাটফর্ম কখনোই ট্র্যাক করতে না পারে।\n\n` +
        `🌐 *Unlimited Proxy Integration:* HTTP, HTTPS, SOCKS5, SSH প্রক্সি খুব সহজেই সেটআপ করার সুবিধা। আইপি লিক হওয়ার কোনো ঝুঁকি নেই।\n\n` +
        `👥 *Team Collaboration & Permission Control:* আপনার টিম মেম্বারদের নির্দিষ্ট প্রোফাইলের অ্যাক্সেস দিতে পারবেন পাসওয়ার্ড শেয়ার না করেই।\n\n` +
        `🤖 *RPA Automation / Synchronization:* একটি ব্রাউজারে কাজ করলেই বাধ্য ব্রাউজারগুলোতে অটোমেটিক একই কাজ হয়ে যাবে (Multi-window sync)। পুনরাবৃত্তি কাজগুলোর জন্য রয়েছে ফ্রি অটোমেশন ফিচার।\n\n` +
        `> ⚡️ *Lightning-Fast Speed & Stability:* কোনো ল্যাগ ছাড়াই স্মুথ ব্রাউজিং এবং হাই-পারফরম্যান্স কুকি কুশন ম্যানেজমেন্ট।\n\n` +
        `> 🎁 *Extra What You Can Offer (স্পেশাল অফার ও সার্ভিস)*\n\n` +
        `🛠 *Instant Setup Guide / Support:* অ্যাকাউন্ট লগইন করা থেকে শুরু করে প্রক্সি সেটআপ করার ফুল ফ্রি গাইডলাইন।\n` +
        `🛡 *Replacement / Uptime Guarantee:* ১ দিনের মধ্যে কোনো মেজর টেকনিক্যাল ইস্যু হলে ইনস্ট্যান্ট সাপোর্ট বা অ্যাকাউন্ট রিপ্লেসমেন্ট গ্যারান্টি।\n\n` +
        `> ⏳ *Duration:* 10 Days Full Access\n\n` +
        `💳 *Price:* 30 TK [1 Account] BD\n` +
        `💳 *Price:* 25 TK [1+ Account] BD\n\n` +
        `🛒 *Buy Now* বাটন টি ক্লিক করলে সরাসরি পেমেন্ট গেটওয়ে বা আপনার ইনবক্সে চলে যাবে।\n` +
        `💬 *Contact Admin:* @prime8088`;

    try {
        await ctx.editMessageText(detailsText, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Close Details', 'close_details')],
                [Markup.button.callback('⬅️ Back to Menu', 'main_menu')]
            ])
        });
    } catch(e) {
        return ctx.reply(detailsText, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('❌ Close Details', 'close_details')],
                [Markup.button.callback('⬅️ Back to Menu', 'main_menu')]
            ])
        });
    }
});

bot.action('close_details', async (ctx) => {
    try {
        await ctx.deleteMessage();
    } catch (e) {
        await ctx.answerCbQuery("Closed!");
    }
});

// Update buy_options to show Package Selection first
bot.action('buy_options', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;

    // Optional admin trace alert when checkout starts
    try {
        await ctx.telegram.sendMessage(
            ADMIN_ID,
            `🛒 *User checked packages!*\n\n` +
            `• Name: ${user.first_name || 'User'}\n` +
            `• Username: @${user.username ? user.username : 'N/A'}\n` +
            `• User ID: \`${user.id}\``,
            { parse_mode: 'Markdown' }
        );
    } catch (e) {}

    // Reset applied coupon when user selects a new package
    await updateUserSession(user.id.toString(), { appliedCoupon: '', discount: 0 });

    const pkgText = "⭐ *AdsPower Seller BD*\n✨ *Select Packages (প্যাকেজ সিলেক্ট করুন)*:\n\n" +
                    "নিচের অপশনগুলো থেকে আপনার প্রয়োজনীয় প্যাকেজটি সিলেক্ট করুন:";
    const pkgExtra = {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('⚡ 1 Account AdsPower = 30 TK', 'pkg_1_30')],
            [Markup.button.callback('🔥 3 Accounts AdsPower = 80 TK', 'pkg_3_80')],
            [Markup.button.callback('👑 5 Accounts AdsPower = 135 TK', 'pkg_5_135')],
            [Markup.button.callback('⬅️ Back to Menu', 'main_menu')]
        ])
    };

    try {
        await ctx.editMessageText(pkgText, pkgExtra);
    } catch(e) {
        return ctx.reply(pkgText, pkgExtra);
    }
});

// Helper function to render payment selection screen with dynamic coupon status
async function showPaymentSelectionScreen(ctx, userId) {
    const session = await getUserSession(userId);
    const price = session.price || 30;
    const discount = session.discount || 0;
    const finalPrice = Math.max(0, price - discount);

    let couponInfo = "";
    if (session.appliedCoupon) {
        couponInfo = `\n🎟️ *Applied Coupon:* \`${session.appliedCoupon}\` (-${discount} TK)\n`;
    }

    const buyText = `📦 *Selected Package:* ${session.packageName} (${price} TK)\n` +
                    couponInfo +
                    `💰 *Total Amount to Pay:* *${finalPrice} TK*\n\n` +
                    `✨ *Select Payment Method*\n` +
                    `পেমেন্ট মেথড সিলেক্ট করুন:`;
    
    const buyExtra = {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🇧🇩 bKash', 'pay_bkash'), Markup.button.callback('🇧🇩 Nagad', 'pay_nagad')],
            [Markup.button.callback('🌐 Binance (USDT)', 'pay_binance'), Markup.button.callback('🌐 Payoneer', 'pay_payoneer')],
            [Markup.button.callback('🎟️ Apply Coupon Code', 'apply_coupon_prompt')],
            [Markup.button.callback('⬅️ Back', 'buy_options')]
        ])
    };

    try {
        await ctx.editMessageText(buyText, buyExtra);
    } catch(e) {
        return ctx.reply(buyText, buyExtra);
    }
}

// Callback handler for package selection
bot.action(/^pkg_(\d+)_(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const count = ctx.match[1];
    const price = ctx.match[2];
    const userId = ctx.from.id.toString();

    const packageName = `${count} Account${count > 1 ? 's' : ''} AdsPower`;
    
    // Save package selection in user session
    await updateUserSession(userId, { packageName, price: parseInt(price), appliedCoupon: '', discount: 0 });
    return showPaymentSelectionScreen(ctx, userId);
});

// Callback to trigger Coupon Input prompt
bot.action('apply_coupon_prompt', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    await updateUserSession(userId, { waitingFor: 'coupon_code' });
    return ctx.reply("🎟️ অনুগ্রহ করে আপনার কুপন কোডটি লিখে পাঠান (যেমন: WELCOME10):");
});

bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;
    return ctx.reply(`👤 *My Profile Info*\n\n• Name: ${user.first_name}\n• Username: @${user.username || 'N/A'}\n• User ID: \`${user.id}\``, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'main_menu')]])
    });
});

bot.action('my_order', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const history = await getUserOrders(userId);

    if (!history || history.length === 0) {
        return ctx.reply("🛍 *My Orders:* আপনার কোনো পূর্ববর্তী অর্ডার নেই।", {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'main_menu')]])
        });
    }

    let text = "🛍 *Your Order History (লাইভ অর্ডার ট্র্যাকিং):*\n\n";
    history.forEach((ord, index) => {
        const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'N/A';
        
        let statusEmoji = "⏳";
        let statusTextBengali = "অ্যাডমিন ভেরিফাই করছেন...";
        
        if (ord.status === 'Completed') {
            statusEmoji = "✅";
            statusTextBengali = "সম্পন্ন হয়েছে (Account Delivered)";
        } else if (ord.status === 'Rejected') {
            statusEmoji = "❌";
            statusTextBengali = "বাতিল করা হয়েছে (Rejected)";
        } else if (ord.status === 'Cancelled') {
            statusEmoji = "❌";
            statusTextBengali = "বাতিল করা হয়েছে (Cancelled)";
        }

        text += `${index + 1}. 📦 *Package:* ${ord.packageName}\n` +
                `   💳 *Method:* ${ord.method ? ord.method.split('|')[0] : 'Unknown'}\n` +
                `   ${statusEmoji} *Status:* ${ord.status} (${statusTextBengali})\n` +
                `   📅 *Date:* ${dateStr}\n`;
                
        if (ord.status === 'Completed') {
            if (ord.customEmail || ord.customPass) {
                text += `   📧 *Email:* \`${ord.customEmail || 'N/A'}\`\n` +
                        `   🔑 *Password:* \`${ord.customPass || 'N/A'}\`\n`;
            }
            if (ord.loginCode) {
                text += `   ⏳ *Login Code:* \`${ord.loginCode}\`\n`;
            }
        }
        text += `\n`;
    });

    try {
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🗑 Clear History', 'clear_my_order')],
                [Markup.button.callback('⬅️ Back to Menu', 'main_menu')]
            ])
        });
    } catch(e) {
        return ctx.reply(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🗑 Clear History', 'clear_my_order')],
                [Markup.button.callback('⬅️ Back to Menu', 'main_menu')]
            ])
        });
    }
});

bot.action('clear_my_order', async (ctx) => {
    await ctx.answerCbQuery("Order history cleared!");
    const userId = ctx.from.id.toString();
    await clearUserOrders(userId);
    return ctx.reply("🗑 আপনার অর্ডার হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।", {
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'main_menu')]])
    });
});

bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🧾 *Transaction Records:* Verified", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'main_menu')]])
    });
});

bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("👑 *Admin Contact:* @prime8088", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to Menu', 'main_menu')]])
    });
});

// FAQ Section Actions
bot.action('faq_menu', async (ctx) => {
    await ctx.answerCbQuery();
    const faqText = "❓ *AdsPower Help Center & FAQ Guide*\n\n" +
                    "আপনার প্রয়োজনীয় প্রশ্নের সমাধান পেতে নিচের যেকোনো একটি টপিক সিলেক্ট করুন:";
    const faqExtra = {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🛠 1. How to Setup Proxy (প্রক্সি সেটআপ)', 'faq_proxy')],
            [Markup.button.callback('🔑 2. Login Code Issue (লগইন কোড সমস্যা)', 'faq_logincode')],
            [Markup.button.callback('🛡 3. Replacement Policy (রিপ্লেসমেন্ট পলিসি)', 'faq_replacement')],
            [Markup.button.callback('⬅️ Back to Main Menu', 'main_menu')]
        ])
    };
    try {
        await ctx.editMessageText(faqText, faqExtra);
    } catch(e) {
        return ctx.reply(faqText, faqExtra);
    }
});

bot.action('faq_proxy', async (ctx) => {
    await ctx.answerCbQuery();
    const text = 
        `🛠 *AdsPower Browser - Proxy Setup Guide*\n\n` +
        `একাধিক অ্যাকাউন্ট সুরক্ষিত রাখতে প্রক্সি সেটআপ করা অত্যন্ত জরুরি। নিচের নিয়মগুলো মেনে সেটআপ করুন:\n\n` +
        `১. *AdsPower Browser* ওপেন করে **"Profiles"** সেকশনে যান এবং **"Single Import"**-এ ক্লিক করুন।\n` +
        `২. **"Proxy Information"** সেকশনে গিয়ে **"Proxy Type"** সিলেক্ট করুন (SOCKS5, HTTP বা HTTPS)।\n` +
        `৩. আপনার প্রক্সি প্রভাইডারের দেওয়া আইপি ও পোর্ট ইনপুট করুন। ফরম্যাট: \`IP:Port\` অথবা ইউজারনেম-পাসওয়ার্ড থাকলে \`IP:Port:Username:Password\`।\n` +
        `৪. **"Check Proxy"** বাটনে ক্লিক করে কানেকশন টেস্ট করুন। যদি সবুজ সংকেত (Green check) আসে, তবে আপনার প্রক্সি সফলভাবে কাজ করছে।\n\n` +
        `⚠️ *পরামর্শ:* লিক এড়াতে সর্বদা প্রিমিয়াম ডেডিকেটেড আইপি ব্যবহার করবেন। ফ্রি প্রক্সি ব্যবহার করলে অ্যাকাউন্ট ব্যান হওয়ার ঝুঁকি থাকে।`;
    
    try {
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    } catch (e) {
        return ctx.reply(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    }
});

bot.action('faq_logincode', async (ctx) => {
    await ctx.answerCbQuery();
    const text = 
        `🔑 *How to Get Login Code (লগইন কোড সমস্যা সমাধান)*\n\n` +
        `আপনি যখন প্রথমবার অ্যাকাউন্টটি আপনার ব্রাউজারে লগইন করতে যাবেন, তখন সিকিউরিটির জন্য একটি লগইন কোড (Login Verification Code) চাইতে পারে।\n\n` +
        `১. ব্রাউজারে কোড চাওয়ার পেজটি ওপেন রাখুন।\n` +
        `২. আমাদের টেলিগ্রাম বটের **"🛍 My Order"** এ যান এবং আপনার একটিভ অর্ডারের নিচে থাকা **"🔑 Get Login Code"** বাটনে ক্লিক করুন।\n` +
        `৩. সাথে সাথে অ্যাডমিনের কাছে আপনার কোড রিকোয়েস্ট চলে যাবে।\n` +
        `৪. অ্যাডমিন কোডটি দেওয়ার সাথে সাথে আপনার চ্যাটে একটি নোটিফিকেশন আসবে। সেখানে ওয়ান-ক্লিক কপি বাটন থাকবে। কোডটি কপি করে ব্রাউজারে বসিয়ে লগইন সম্পূর্ণ করুন।`;
    
    try {
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    } catch (e) {
        return ctx.reply(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    }
});

bot.action('faq_replacement', async (ctx) => {
    await ctx.answerCbQuery();
    const text = 
        `🛡 *AdsPower Seller BD - Warranty & Replacement Policy*\n\n` +
        `আমরা আমাদের গ্রাহকদের সর্বোচ্চ সার্ভিস দেওয়ার চেষ্টা করি। রিপ্লেসমেন্টের ক্ষেত্রে নিচের নিয়মগুলো প্রযোজ্য হবে:\n\n` +
        `• *২৪ ঘণ্টার গ্যারান্টি:* অ্যাকাউন্ট ডেলিভারি নেওয়ার পর প্রথম ২৪ ঘণ্টার মধ্যে কোনো মেজর টেকনিক্যাল সমস্যা বা লগইন এরর হলে সম্পূর্ণ ফ্রিতে অ্যাকাউন্ট রিপ্লেস করে দেওয়া হবে।\n` +
        `• *কখন রিপ্লেসমেন্ট পাবেন না:*\n` +
        `  ১. ফ্রি বা নিম্নমানের আইপি/প্রক্সি ব্যবহারের কারণে যদি অ্যাকাউন্ট ব্যান বা রেস্ট্রিক্ট হয়।\n` +
        `  ২. ফেসবুক বা সোশ্যাল মিডিয়ার নিজস্ব সিকিউরিটি অ্যালগরিদমের পলিসি ভায়োলেট করলে (যেমন: অতিরিক্ত মেসেজ বা স্প্যামিং করা)।\n\n` +
        `💬 যেকোনো তথ্যের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন: @prime8088`;
    
    try {
        await ctx.editMessageText(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    } catch (e) {
        return ctx.reply(text, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([[Markup.button.callback('⬅️ Back to FAQ', 'faq_menu')]])
        });
    }
});

// Payment Flows with Dynamic Prices & Coupons
bot.action('pay_bkash', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const session = await getUserSession(userId);
    await updateUserSession(userId, { method: 'bKash' });
    const finalPrice = Math.max(0, session.price - session.discount);
    
    return ctx.reply(
        `💳 **bKash Payment Details:**\n` +
        `📞 Send Money: \`01864339154\`\n` +
        `💰 Amount to Pay: *${finalPrice} TK*\n` +
        (session.appliedCoupon ? `🎟️ Discount Coupon: *${session.appliedCoupon}* (-${session.discount} TK)\n` : '') +
        `📦 Package: *${session.packageName}*\n\n` +
        `নিচের বাটনে ক্লিক করে TrxID দিন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ TrxID দিন', 'input_trx')],
                [Markup.button.callback('⬅️ Back', 'buy_options')]
            ])
        }
    );
});

bot.action('pay_nagad', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const session = await getUserSession(userId);
    await updateUserSession(userId, { method: 'Nagad' });
    const finalPrice = Math.max(0, session.price - session.discount);
    
    return ctx.reply(
        `💳 **Nagad Payment Details:**\n` +
        `📞 Send Money: \`01864339154\`\n` +
        `💰 Amount to Pay: *${finalPrice} TK*\n` +
        (session.appliedCoupon ? `🎟️ Discount Coupon: *${session.appliedCoupon}* (-${session.discount} TK)\n` : '') +
        `📦 Package: *${session.packageName}*\n\n` +
        `নিচের বাটনে ক্লিক করে TrxID দিন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ TrxID দিন', 'input_trx')],
                [Markup.button.callback('⬅️ Back', 'buy_options')]
            ])
        }
    );
});

bot.action('pay_binance', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const session = await getUserSession(userId);
    await updateUserSession(userId, { method: 'Binance' });
    const finalPrice = Math.max(0, session.price - session.discount);
    
    return ctx.reply(
        `🌐 **Binance Payment Details:**\n` +
        `📌 Pay ID: \`955102483\`\n` +
        `💰 Amount to Pay: *${finalPrice} TK* (or USDT equivalent)\n` +
        (session.appliedCoupon ? `🎟️ Discount Coupon: *${session.appliedCoupon}* (-${session.discount} TK)\n` : '') +
        `📦 Package: *${session.packageName}*\n\n` +
        `স্ক্রিনশট বা TxID দিন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📤 স্ক্রিনশট বা TxID দিন', 'input_screenshot')],
                [Markup.button.callback('⬅️ Back', 'buy_options')]
            ])
        }
    );
});

bot.action('pay_payoneer', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const session = await getUserSession(userId);
    await updateUserSession(userId, { method: 'Payoneer' });
    const finalPrice = Math.max(0, session.price - session.discount);
    
    return ctx.reply(
        `🌐 **Payoneer Details:**\n` +
        `📧 Email: \`mithuchandra647@gmail.com\`\n` +
        `💰 Amount to Pay: *${finalPrice} TK* (or USD equivalent)\n` +
        (session.appliedCoupon ? `🎟️ Discount Coupon: *${session.appliedCoupon}* (-${session.discount} TK)\n` : '') +
        `📦 Package: *${session.packageName}*\n\n` +
        `Details দিন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ Details দিন', 'input_payoneer_details')],
                [Markup.button.callback('⬅️ Back', 'buy_options')]
            ])
        }
    );
});

bot.action('input_trx', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    await updateUserSession(userId, { waitingFor: 'trx' });
    return ctx.reply("আপনার পেমেন্টের TrxID কোডটি লিখে পাঠান:");
});

bot.action('input_screenshot', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    await updateUserSession(userId, { waitingFor: 'screenshot' });
    return ctx.reply("আপনার বাইন্যান্স পেমেন্টের স্ক্রিনশট বা TxID ছবি আকারে পাঠান:");
});

bot.action('input_payoneer_details', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    await updateUserSession(userId, { waitingFor: 'payoneer_details' });
    return ctx.reply("আপনার Payoneer Email এবং Customer ID লিখে পাঠান:");
});

// Text / Input Handler
bot.on(['text', 'photo'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const text = ctx.message ? ctx.message.text : null;

    if (isAdmin(ctx)) {
        if (text === '/admin' || text === '👑 Close Admin Panel 👑' || text === '⭐ 📦 Pending Orders ⭐' || text === '⭐ 👥 Total Bot Users ⭐' || text === '📢 Broadcast 📢' || text === '📊 Sales Report 📊' || text === '🎟️ Coupons 🎟️') {
            if (text === '/admin' || text === '⭐ 📦 Pending Orders ⭐') {
                if (text === '/admin') {
                    await ctx.reply("👑 *Welcome to Admin Golden Control Panel*", { parse_mode: 'Markdown', ...adminReplyKeyboard });
                }
                return showPendingOrdersMenu(ctx);
            } 
            if (text === '⭐ 👥 Total Bot Users ⭐') {
                return showTotalUsersStats(ctx);
            }
            if (text === '👑 Close Admin Panel 👑') {
                return ctx.reply("👑 Admin Panel Closed.", Markup.removeKeyboard());
            }
            if (text === '📢 Broadcast 📢') {
                await updateAdminSession(userId, { step: 'waiting_for_broadcast' });
                return ctx.reply("📢 আপনার ব্রডকাস্ট মেসেজটি (লেখা বা ছবি) পাঠান যা সকল বটের ইউজারের কাছে পাঠানো হবে:");
            }
            if (text === '📊 Sales Report 📊') {
                const stats = await getSalesReportStats();
                const reportText = 
                    `📊 *AdsPower Bot Sales Report* 📊\n\n` +
                    `• Total Completed Sales: *${stats.totalCount}*\n` +
                    `• Total Revenue: *${stats.totalRevenue} TK*\n\n` +
                    `• Today's Sales: *${stats.todayRevenue} TK*\n` +
                    `• This Month's Sales: *${stats.monthRevenue} TK*\n\n` +
                    `❤️ Keep hustling! Keep selling! 🚀`;
                return ctx.reply(reportText, { parse_mode: 'Markdown' });
            }
            if (text === '🎟️ Coupons 🎟️') {
                return showCouponsMenu(ctx);
            }
        }

        const adminSession = await getAdminSession(userId);
        if (adminSession && adminSession.step) {
            const state = adminSession.step;
            const targetUser = adminSession.targetUserId;
            const extraData = adminSession.extraData;

            if (state === 'waiting_for_broadcast') {
                await clearAdminSession(userId);
                const userList = await getUserIdsForBroadcast();
                
                if (userList.length === 0) {
                    return ctx.reply("❌ ব্রডকাস্ট করার জন্য কোনো ইউজার পাওয়া যায়নি।");
                }

                await ctx.reply(`📢 ব্রডকাস্ট পাঠানো শুরু হয়েছে... মোট ইউজার: ${userList.length} জন।`);
                let success = 0;
                let fail = 0;

                for (const uId of userList) {
                    try {
                        await ctx.telegram.copyMessage(uId, ctx.chat.id, ctx.message.message_id);
                        success++;
                    } catch (err) {
                        fail++;
                    }
                }
                
                return ctx.reply(
                    `📢 *Broadcast Completed!* \n\n` +
                    `✅ সফলভাবে পাঠানো হয়েছে: *${success}* জনের কাছে\n` +
                    `❌ ব্যর্থ হয়েছে: *${fail}* জনের কাছে (বট ব্লক করার কারণে হতে পারে)`,
                    { parse_mode: 'Markdown' }
                );
            }

            if (state === 'waiting_for_coupon_code' && text) {
                const couponCode = text.trim().toUpperCase();
                await updateAdminSession(userId, {
                    step: 'waiting_for_coupon_discount',
                    extraData: couponCode
                });
                return ctx.reply(`🎟️ কুপন *${couponCode}* এর জন্য ডিসকাউন্ট মূল্য (টাকায়) লিখে পাঠান (যেমন: 10):`);
            }

            if (state === 'waiting_for_coupon_discount' && text) {
                const discount = parseInt(text.trim());
                const couponCode = extraData;
                await clearAdminSession(userId);

                if (isNaN(discount)) {
                    return ctx.reply("❌ ভুল ইনপুট! ডিসকাউন্ট সংখ্যায় হতে হবে। কুপন তৈরি বাতিল করা হয়েছে।");
                }

                if (db.isConfigured()) {
                    await db.createCoupon(couponCode, discount);
                } else {
                    memoryCoupons[couponCode] = discount;
                }

                return ctx.reply(`✅ কুপন কোড সফলভাবে যুক্ত হয়েছে!\n• Code: *${couponCode}*\n• Discount: *${discount} TK*`, { parse_mode: 'Markdown' });
            }

            if (state === 'waiting_for_reject_reason' && text) {
                const reason = text.trim();
                await clearAdminSession(userId);

                // Update order to Rejected in DB / memory
                await rejectOrderDB(targetUser);

                try {
                    await ctx.telegram.sendMessage(
                        targetUser,
                        `❌ *আপনার অর্ডারটি রিজেক্ট করা হয়েছে!*\n\n` +
                        `আপনার AdsPower অর্ডারের পেমেন্টটি অ্যাডমিন ভেরিফাই করতে পারেননি।\n\n` +
                        `• *কারণ:* ${reason}\n\n` +
                        `দয়া করে সঠিক ট্রানজেকশন প্রুফ দিয়ে আবার অর্ডার করুন অথবা অ্যাডমিনের সাথে যোগাযোগ করুন।`,
                        { parse_mode: 'Markdown' }
                    );
                    return ctx.reply(`✅ Successfully Rejected Order & Sent Reason to User!`);
                } catch (err) {
                    return ctx.reply(`❌ ইউজারকে রিজেক্ট মেসেজ পাঠানো যায়নি।`);
                }
            }

            if (state === 'waiting_for_email' && text) {
                await updateAdminSession(userId, {
                    step: 'waiting_for_password',
                    customEmail: text.trim(),
                    targetUserId
                });
                return ctx.reply("🔑 এখন এই অ্যাকাউন্টের **Password** টি লিখে পাঠান:");
            
            } else if (state === 'waiting_for_password' && text) {
                const customPass = text.trim();
                const customEmail = adminSession.customEmail;
                await clearAdminSession(userId);

                // Update order in Supabase / memory
                if (db.isConfigured()) {
                    await db.updateOrderStatus(targetUser, 'Completed', customEmail, customPass);
                }
                if (memoryPendingOrders[targetUser]) {
                    memoryPendingOrders[targetUser].status = 'Completed';
                    delete memoryPendingOrders[targetUser];
                }

                // Add to order history
                if (!memoryUserOrderHistory[targetUser]) memoryUserOrderHistory[targetUser] = [];
                memoryUserOrderHistory[targetUser].push({
                    packageName: 'AdsPower 10 Days Full Access',
                    method: 'Manual Delivery',
                    status: 'Completed',
                    createdAt: new Date().toISOString()
                });

                try {
                    await ctx.telegram.sendMessage(
                        targetUser,
                        "🎉 *Congratulations for your purchase!* ❤️\n\n" +
                        "আপনার পেমেন্ট সফলভাবে ভেরিফাই ও কনফার্ম হয়েছে!\n" +
                        "নিচের বাটনগুলোতে ক্লিক করে আপনার ইমেইল ও পাসওয়ার্ড সহজে কপি করে নিন:",
                        {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                [Markup.button.callback(`📧 Email: ${customEmail}`, `copy_email_${customEmail}`)],
                                [Markup.button.callback(`🔑 Password: ${customPass}`, `copy_pass_${customPass}`)],
                                [Markup.button.callback('🔑 Get Login Code', `get_code_${targetUser}`)],
                                [Markup.button.callback('📦 AdsPower Details', 'details')]
                            ])
                        }
                    );
                    return ctx.reply(`✅ Successfully Sent Custom Email & Password to User!`);
                } catch (err) {
                    return ctx.reply(`❌ ইউজারকে মেসেজ পাঠানো যায়নি।`);
                }
            
            } else if (state === 'waiting_for_login_code' && text) {
                const loginCode = text.trim();
                await clearAdminSession(userId);

                if (db.isConfigured()) {
                    await db.updateOrderLoginCode(targetUser, loginCode);
                }

                try {
                    await ctx.telegram.sendMessage(
                        targetUser,
                        "🚨 *আপনার Login Code নিচে দেওয়া হলো:*\n\nবাটনে ক্লিক করে কোডটি চ্যাটে নিয়ে কপি করে নিন। লগইন সম্পন্ন হলে নিচের **Done** বাটনে ক্লিক করুন:",
                        {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                [Markup.button.callback(`⏳ Code: ${loginCode}`, `copy_code_${loginCode}`)],
                                [Markup.button.callback('✅ Done ❤️', 'login_done')]
                            ])
                        }
                    );
                    return ctx.reply(`✅ ইউজারের কাছে লগইন কোড সফলভাবে পাঠানো হয়েছে!`);
                } catch (err) {
                    return ctx.reply(`❌ ইউজারকে লগইন কোড পাঠানো যায়নি।`);
                }
            }
        }
    }

    const session = await getUserSession(userId);
    if (!session) return;

    if (session.waitingFor === 'coupon_code' && text) {
        const inputCode = text.trim().toUpperCase();
        await updateUserSession(userId, { waitingFor: null });

        let coupon = null;
        if (db.isConfigured()) {
            coupon = await db.getCoupon(inputCode);
        } else {
            if (memoryCoupons[inputCode] !== undefined) {
                coupon = { code: inputCode, discount_amount: memoryCoupons[inputCode] };
            }
        }

        if (coupon) {
            await updateUserSession(userId, {
                appliedCoupon: coupon.code,
                discount: coupon.discount_amount
            });
            await ctx.reply(`✅ কুপন সফলভাবে যুক্ত হয়েছে! আপনি *${coupon.discount_amount} TK* ডিসকাউন্ট পেয়েছেন।`, { parse_mode: 'Markdown' });
        } else {
            await ctx.reply(`❌ দুঃখিত! এই কুপন কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে।`);
        }
        return showPaymentSelectionScreen(ctx, userId);
    }

    const state = session.waitingFor;
    if (state === 'trx' || state === 'screenshot' || state === 'payoneer_details') {
        const proof = text || (ctx.message && ctx.message.photo ? "Photo Provided" : "Details Provided");
        await updateUserSession(userId, { proof, waitingFor: null });

        try { await ctx.deleteMessage(); } catch(e) {}

        return ctx.reply("✅ আপনার পেমেন্ট ইনফো গ্রহণ করা হয়েছে। নিচে কনফার্ম বাটনে ক্লিক করুন:", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✅ Confirm Payment', 'final_confirm')]
            ])
        });
    }
});

bot.action(/^copy_email_(.+)$/, async (ctx) => {
    const email = ctx.match[1];
    await ctx.answerCbQuery("Email sent below to copy!");
    return ctx.reply(`📧 আপনার ইমেইল (কপি করতে চেপে ধরে রাখুন):\n\`${email}\``, { parse_mode: 'Markdown' });
});

bot.action(/^copy_pass_(.+)$/, async (ctx) => {
    const password = ctx.match[1];
    await ctx.answerCbQuery("Password sent below to copy!");
    return ctx.reply(`🔑 আপনার পাসওয়ার্ড (কপি করতে চেপে ধরে রাখুন):\n\`${password}\``, { parse_mode: 'Markdown' });
});

bot.action(/^copy_code_(.+)$/, async (ctx) => {
    const code = ctx.match[1];
    await ctx.answerCbQuery("Login Code sent below to copy!");
    return ctx.reply(`⏳ আপনার লগইন কোড (কপি করতে চেপে ধরে রাখুন):\n\`${code}\``, { parse_mode: 'Markdown' });
});

bot.action('final_confirm', async (ctx) => {
    await ctx.answerCbQuery("Payment Submitted!");
    const user = ctx.from;
    const userId = user.id.toString();
    const session = await getUserSession(userId);
    const method = session ? session.method || 'Unknown' : 'Unknown';
    const proof = session ? session.proof || 'N/A' : 'N/A';
    const packageName = session ? session.packageName || '1 Account AdsPower' : '1 Account AdsPower';
    const price = session ? session.price || 30 : 30;
    const discount = session ? session.discount || 0 : 0;
    const finalPrice = Math.max(0, price - discount);

    if (db.isConfigured()) {
        await db.createOrder({
            userId,
            name: user.first_name || 'User',
            username: user.username || 'N/A',
            packageName: packageName,
            method,
            proof,
            pricePaid: finalPrice
        });
    }

    memoryPendingOrders[userId] = {
        name: user.first_name || 'User',
        username: user.username || 'N/A',
        userId: userId,
        method,
        proof,
        status: 'Pending Verification',
        packageName: packageName,
        pricePaid: finalPrice
    };

    if (!memoryUserOrderHistory[userId]) memoryUserOrderHistory[userId] = [];
    memoryUserOrderHistory[userId].push({
        packageName: packageName,
        method,
        status: 'Pending Verification',
        date: new Date().toLocaleString()
    });

    let proofText = `📦 *Order Name:* ${packageName}\n` +
                    (session.appliedCoupon ? `🎟️ *Coupon:* ${session.appliedCoupon} (-${discount} TK)\n` : '') +
                    `💰 *Price:* ${finalPrice} TK\n` +
                    `💳 *Payment Method:* ${method}\n` +
                    `👤 *User Name:* ${user.first_name || 'User'}\n` +
                    `🔗 *Username:* @${user.username || 'N/A'}\n` +
                    `🆔 *User ID:* \`${userId}\`\n` +
                    `📌 *Proof:* \`${proof}\``;

    try {
        await ctx.telegram.sendMessage(ADMIN_ID, `🚨 *New Order Received!*\n\n` + proofText, { parse_mode: 'Markdown' });
    } catch (err) {}

    try {
        await ctx.telegram.sendMessage(GROUP_ID, `🚨 *New Order Received (Group Log)!*\n\n` + proofText, { parse_mode: 'Markdown' });
    } catch (err) {}

    // Reset user session applied coupon and discount after placing order
    await updateUserSession(userId, { appliedCoupon: '', discount: 0 });

    return ctx.reply(
        "⏳ *Payment Request Submitted Successfully!* \n\n" +
        "আপনার পেমেন্টটি সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট চেক করছেন...\n" +
        "দয়া করে অপেক্ষা করুন! ❤️",
        { parse_mode: 'Markdown' }
    );
});

// ================= ADMIN MENUS =================

async function showPendingOrdersMenu(ctx) {
    const orders = await getPendingOrders();

    if (!orders || orders.length === 0) {
        return ctx.reply("⭐ *Pending Orders:* বর্তমানে কোনো পেন্ডিং অর্ডার নেই।", { parse_mode: 'Markdown' });
    }

    let buttons = [];
    orders.forEach((ord) => {
        const name = ord.name || 'User';
        const method = ord.method || 'N/A';
        const id = ord.userId;
        buttons.push([Markup.button.callback(`📦 ${name} [ ${method} ]`, `view_order_${id}`)]);
    });

    return ctx.reply("⭐ *Select an Order to Check Details:*", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    });
}

bot.action(/^view_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return ctx.answerCbQuery("Unauthorized!", { show_alert: true });
    await ctx.answerCbQuery();
    
    const targetUserId = ctx.match[1];
    const ord = await getOrderForUser(targetUserId);

    if (!ord) return ctx.reply("❌ অর্ডারটি পাওয়া যায়নি বা ইতিমধ্যে প্রসেস হয়ে গেছে।");

    let detailsMsg = `📋 *Order Details*\n\n` +
                     `👤 *Name:* ${ord.name}\n` +
                     `🔗 *Username:* @${ord.username}\n` +
                     `🆔 *User ID:* \`${ord.userId}\`\n` +
                     `💳 *Method:* ${ord.method}\n` +
                     `📌 *Proof:* \`${ord.proof}\``;

    return ctx.reply(detailsMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirm & Input Email/Pass', `start_custom_pass_${targetUserId}`)],
            [Markup.button.callback('❌ Reject Order', `start_reject_order_${targetUserId}`)]
        ])
    });
});

bot.action(/^start_custom_pass_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];

    await updateAdminSession(ctx.from.id.toString(), {
        step: 'waiting_for_email',
        targetUserId: targetUserId
    });

    return ctx.reply("📧 অনুগ্রহ করে ইউজারের জন্য নির্ধারিত **Email** টি লিখে পাঠান:");
});

bot.action(/^start_reject_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];

    await updateAdminSession(ctx.from.id.toString(), {
        step: 'waiting_for_reject_reason',
        targetUserId: targetUserId
    });

    return ctx.reply("❌ অর্ডারটি রিজেক্ট করার কারণটি লিখে পাঠান (যেমন: আপনার TrxID মিলছে না):");
});

async function showTotalUsersStats(ctx) {
    let usersList = null;
    if (db.isConfigured()) {
        usersList = await db.getAllUsers();
    }

    let totalCount = 0;
    let buttons = [];

    if (usersList !== null && usersList.length > 0) {
        totalCount = usersList.length;
        usersList.forEach((u, index) => {
            buttons.push([Markup.button.callback(`👤 User #${index + 1} (ID: ${u.user_id})`, `inspect_user_${u.user_id}`)]);
        });
    } else {
        totalCount = memoryAllStartedUsers.size;
        Array.from(memoryAllStartedUsers).forEach((id, index) => {
            buttons.push([Markup.button.callback(`👤 User #${index + 1} (ID: ${id})`, `inspect_user_${id}`)]);
        });
    }

    return ctx.reply(
        `⭐ *Total Bot Users Statistics*\n\n` +
        `🚀 মোট কতজন বট স্টার্ট করেছে: **${totalCount} জন**\n\n` +
        `নিচের তালিকা থেকে যেকোনো ইউজারের ওপর ক্লিক করে দেখতে পারেন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons.slice(0, 50))
        }
    );
}

bot.action(/^inspect_user_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const id = ctx.match[1];
    return ctx.reply(`👤 *User Details*\n• Telegram User ID: \`${id}\``, { parse_mode: 'Markdown' });
});

bot.action(/^get_code_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery("Login code request sent to Admin!");
    const user = ctx.from;
    const targetUserId = ctx.match[1];

    try {
        await ctx.telegram.sendMessage(
            ADMIN_ID, 
            `🔑 *Login Code Request from User!*\n\n👤 *User:* ${user.first_name} (\`${targetUserId}\`)\n\nদয়া করে এই ইউজারকে লগইন কোড প্রদান করুন।`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📤 Send Login Code', `send_code_admin_${targetUserId}`)]
                ])
            }
        );
    } catch (err) {}

    return ctx.reply("📤 অ্যাডমিনের কাছে কোডের অনুরোধ পাঠানো হয়েছে। অ্যাডমিন কোড দিলে আপনার কাছে মেসেজ চলে আসবে। দয়া করে অপেক্ষা করুন...");
});

bot.action(/^send_code_admin_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];

    await updateAdminSession(ctx.from.id.toString(), {
        step: 'waiting_for_login_code',
        targetUserId: targetUserId
    });

    return ctx.reply(`🔑 অনুগ্রহ করে ইউজার (ID: \`${targetUserId}\`) এর জন্য **Login Code** টি লিখে পাঠান:`, { parse_mode: 'Markdown' });
});

bot.action('login_done', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id.toString();
    const botUsername = ctx.botInfo ? `@${ctx.botInfo.username}` : '';
    return ctx.reply(
        `❤️ *Thank You for Purchasing from AdsPower Seller BD!*\n` +
        `Take Love : \`${userId}\`\n\n` +
        `আপনাদের প্রিমিয়াম পাস সফলভাবে অ্যাক্টিভ হয়েছে। আমাদের সেবা নেওয়ার জন্য আপনাকে আন্তরিক ধন্যবাদ! যেকোনো প্রয়োজনে আবার যোগাযোগ করবেন। 🚀\n\n` +
        `${botUsername}`,
        { parse_mode: 'Markdown' }
    );
});

// Admin Coupon Management Menus
async function showCouponsMenu(ctx) {
    let coupons = [];
    if (db.isConfigured()) {
        coupons = await db.getAllCoupons();
    } else {
        coupons = Object.keys(memoryCoupons).map(code => ({ code, discount_amount: memoryCoupons[code] }));
    }

    let inlineButtons = [];
    if (coupons && coupons.length > 0) {
        coupons.forEach(cp => {
            inlineButtons.push([
                Markup.button.callback(`🎟️ ${cp.code} (-${cp.discount_amount} TK)`, 'noop'),
                Markup.button.callback('❌ Delete', `delete_coupon_${cp.code}`)
            ]);
        });
    }

    inlineButtons.push([Markup.button.callback('➕ Add Coupon', 'admin_add_coupon')]);

    return ctx.reply("🎟️ *Active Coupons Management Menu:*\n\nকুপন কোড ও ডিসকাউন্ট অ্যাড বা ডিলিট করুন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(inlineButtons)
    });
}

bot.action('noop', async (ctx) => {
    await ctx.answerCbQuery();
});

bot.action('admin_add_coupon', async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const adminId = ctx.from.id.toString();
    await updateAdminSession(adminId, { step: 'waiting_for_coupon_code' });
    return ctx.reply("🎟️ অনুগ্রহ করে নতুন **কুপন কোডটি** লিখুন (যেমন: BD50):");
});

bot.action(/^delete_coupon_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery("Coupon Deleted!");
    const code = ctx.match[1].toUpperCase();

    if (db.isConfigured()) {
        await db.deleteCoupon(code);
    } else {
        delete memoryCoupons[code];
    }

    try { await ctx.deleteMessage(); } catch(e) {}
    return showCouponsMenu(ctx);
});

// Vercel Serverless Function Handler
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ status: 'ok' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error processing update' });
        }
    } else {
        res.status(200).json({ message: 'AdsPower Bot is running successfully!' });
    }
};
