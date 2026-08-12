const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc');
const ADMIN_ID = '1262396547';
const GROUP_ID = '-5569242233';

const userSession = {};
const pendingOrders = {}; 
const allStartedUsers = new Set(); 
const userOrderHistory = {}; 
const adminSession = {}; 

function isAdmin(ctx) {
    const userId = ctx.from.id.toString();
    return userId === ADMIN_ID;
}

const adminReplyKeyboard = Markup.keyboard([
    ['⭐ 📦 Pending Orders ⭐', '⭐ 👥 Total Bot Users ⭐'],
    ['👑 Close Admin Panel 👑']
]).resize();

bot.start((ctx) => {
    const userId = ctx.from.id.toString();
    allStartedUsers.add(userId);
    const userName = ctx.from.first_name || "User";
    return ctx.reply(
        `⭐ *AdsPower Seller BD*\n\n🚀 *স্বাগতম ${userName}! আপনি আমাদের লাকি কাস্টমার!* \n\nUnlock Ultimate Multi-Accounting Security & Speed!\nনিচের বাটনগুলো থেকে আপনার প্রয়োজনীয় অপশনটি সিলেক্ট করুন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📦 AdsPower Details', 'details')],
                [Markup.button.callback('🛒 Buy Now', 'buy_options')],
                [Markup.button.callback('👤 My Profile', 'profile'), Markup.button.callback('🛍 My Order', 'my_order')],
                [Markup.button.callback('🧾 Transaction', 'transaction'), Markup.button.callback('📞 Contact Support', 'support')]
            ])
        }
    );
});

bot.action('details', async (ctx) => {
    await ctx.answerCbQuery();
    const detailsText = `🚀 *AdsPower Antidetect Browser - 10 Days Premium Pass*\n\n💳 *Price:* 30 TK [1 Account] BD\n💳 *Price:* 25 TK [1+ Account] BD\n\n💬 *Contact Admin:* @prime8088`;
    return ctx.reply(detailsText, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([ [Markup.button.callback('❌ Close Details', 'close_details')] ])
    });
});

bot.action('close_details', async (ctx) => { try { await ctx.deleteMessage(); } catch (e) { await ctx.answerCbQuery("Closed!"); } });

bot.action('buy_options', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("✨ *Select Payment Method*:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🇧🇩 bKash', 'pay_bkash'), Markup.button.callback('🇧🇩 Nagad', 'pay_nagad')],
            [Markup.button.callback('🌐 Binance (USDT)', 'pay_binance'), Markup.button.callback('🌐 Payoneer', 'pay_payoneer')]
        ])
    });
});

bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;
    return ctx.reply(`👤 *My Profile Info*\n\n• Name: ${user.first_name}\n• Username: @${user.username || 'N/A'}\n• User ID: \`${user.id}\``, { parse_mode: 'Markdown' });
});

bot.action('my_order', async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const history = userOrderHistory[userId];
    if (!history || history.length === 0) return ctx.reply("🛍 *My Orders:* আপনার কোনো পূর্ববর্তী অর্ডার নেই।", { parse_mode: 'Markdown' });
    let text = "🛍 *Your Order History:*\n\n";
    history.forEach((ord, index) => { text += `${index + 1}. *Package:* ${ord.packageName}\n   *Status:* ${ord.status}\n\n`; });
    return ctx.reply(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard([ [Markup.button.callback('🗑 Clear History', 'clear_my_order')] ]) });
});

bot.action('clear_my_order', async (ctx) => { await ctx.answerCbQuery("Order history cleared!"); userOrderHistory[ctx.from.id] = []; return ctx.reply("🗑 আপনার অর্ডার হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।"); });

bot.action('transaction', async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("🧾 *Transaction Records:* Verified", { parse_mode: 'Markdown' }); });
bot.action('support', async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("👑 *Admin Contact:* @prime8088", { parse_mode: 'Markdown' }); });

bot.action('pay_bkash', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id] = { method: 'bKash' }; return ctx.reply("📞 Send Money: `01864339154`\n\nনিচের বাটনে ক্লিক করে TrxID দিন:", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('✍️ TrxID দিন', 'input_trx')]]) }); });
bot.action('pay_nagad', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id] = { method: 'Nagad' }; return ctx.reply("📞 Send Money: `01864339154`\n\nনিচের বাটনে ক্লিক করে TrxID দিন:", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('✍️ TrxID দিন', 'input_trx')]]) }); });
bot.action('pay_binance', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id] = { method: 'Binance' }; return ctx.reply("📌 Pay ID: `955102483`\n\nস্ক্রিনশট বা TxID দিন:", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('📤 স্ক্রিনশট বা TxID দিন', 'input_screenshot')]]) }); });
bot.action('pay_payoneer', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id] = { method: 'Payoneer' }; return ctx.reply("📧 Email: `mithuchandra647@gmail.com`\n\nDetails দিন:", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([[Markup.button.callback('✍️ Details দিন', 'input_payoneer_details')]]) }); });

bot.action('input_trx', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id].waitingFor = 'trx'; return ctx.reply("আপনার পেমেন্টের TrxID কোডটি লিখে পাঠান:"); });
bot.action('input_screenshot', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id].waitingFor = 'screenshot'; return ctx.reply("আপনার বাইন্যান্স পেমেন্টের স্ক্রিনশট বা TxID ছবি আকারে পাঠান:"); });
bot.action('input_payoneer_details', async (ctx) => { await ctx.answerCbQuery(); userSession[ctx.from.id].waitingFor = 'payoneer_details'; return ctx.reply("আপনার Payoneer Email এবং Customer ID লিখে পাঠান:"); });

bot.on(['text', 'photo'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const text = ctx.message.text;
    if (isAdmin(ctx)) {
        if (text === '/admin' || text === '👑 Close Admin Panel 👑' || text === '⭐ 📦 Pending Orders ⭐' || text === '⭐ 👥 Total Bot Users ⭐') {
            if (text === '/admin' || text === '⭐ 📦 Pending Orders ⭐') {
                if (text === '/admin') await ctx.reply("👑 *Welcome to Admin Golden Control Panel*", { parse_mode: 'Markdown', ...adminReplyKeyboard });
                return showPendingOrdersMenu(ctx);
            } 
            if (text === '⭐ 👥 Total Bot Users ⭐') return showTotalUsersStats(ctx);
            if (text === '👑 Close Admin Panel 👑') return ctx.reply("👑 Admin Panel Closed.", Markup.removeKeyboard());
        }
        if (adminSession[userId] && adminSession[userId].step) {
            const state = adminSession[userId].step;
            const targetUser = adminSession[userId].targetUserId;
            if (state === 'waiting_for_email') { adminSession[userId].customEmail = text.trim(); adminSession[userId].step = 'waiting_for_password'; return ctx.reply("🔑 Password টি লিখে পাঠান:"); }
            else if (state === 'waiting_for_password') {
                const customPass = text.trim(); const customEmail = adminSession[userId].customEmail;
                delete adminSession[userId]; delete pendingOrders[targetUser];
                await ctx.telegram.sendMessage(targetUser, "🎉 *Congratulations!* ❤️\n\nআপনার পেমেন্ট কনফার্ম হয়েছে!\nনিচে ক্লিক করে কপি করে নিন:", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([ [Markup.button.callback(`📧 Email: ${customEmail}`, `copy_email_${customEmail}`)], [Markup.button.callback(`🔑 Pass: ${customPass}`, `copy_pass_${customPass}`)], [Markup.button.callback('🔑 Get Login Code', `get_code_${targetUser}`)] ]) });
                return ctx.reply(`✅ Sent to User!`);
            } else if (state === 'waiting_for_login_code') {
                const loginCode = text.trim(); delete adminSession[userId];
                await ctx.telegram.sendMessage(targetUser, "🚨 *Login Code:*", { parse_mode: 'Markdown', ...Markup.inlineKeyboard([ [Markup.button.callback(`⏳ Code: ${loginCode}`, `copy_code_${loginCode}`)], [Markup.button.callback('✅ Done ❤️', 'login_done')] ]) });
                return ctx.reply(`✅ Login code sent!`);
            }
        }
    }
    if (!userSession[userId] || !userSession[userId].waitingFor) return;
    const state = userSession[userId].waitingFor;
    if (state === 'trx' || state === 'screenshot' || state === 'payoneer_details') {
        userSession[userId].proof = text || (ctx.message.photo ? "Photo Provided" : "Details Provided");
        userSession[userId].waitingFor = null;
        try { await ctx.deleteMessage(); } catch(e) {}
        return ctx.reply("✅ পেমেন্ট ইনফো গৃহীত হয়েছে। নিচে কনফার্ম করুন:", { ...Markup.inlineKeyboard([ [Markup.button.callback('✅ Confirm Payment', 'final_confirm')] ]) });
    }
});

bot.action(/^copy_email_(.+)$/, async (ctx) => { const email = ctx.match[1]; await ctx.answerCbQuery("Copied!"); return ctx.reply(`📧 Email:\n\`${email}\``, { parse_mode: 'Markdown' }); });
bot.action(/^copy_pass_(.+)$/, async (ctx) => { const password = ctx.match[1]; await ctx.answerCbQuery("Copied!"); return ctx.reply(`🔑 Pass:\n\`${password}\``, { parse_mode: 'Markdown' }); });
bot.action(/^copy_code_(.+)$/, async (ctx) => { const code = ctx.match[1]; await ctx.answerCbQuery("Copied!"); return ctx.reply(`⏳ Code:\n\`${code}\``, { parse_mode: 'Markdown' }); });

bot.action('final_confirm', async (ctx) => {
    await ctx.answerCbQuery("Submitted!");
    const user = ctx.from; const userId = user.id.toString(); const data = userSession[userId] || { method: 'Unknown', proof: 'N/A' };
    pendingOrders[userId] = { name: user.first_name, username: user.username || 'N/A', userId: userId, method: data.method, proof: data.proof };
    if (!userOrderHistory[userId]) userOrderHistory[userId] = [];
    userOrderHistory[userId].push({ packageName: 'AdsPower 10 Days', method: data.method, status: 'Pending', date: new Date().toLocaleString() });
    await ctx.telegram.sendMessage(ADMIN_ID, `🚨 *New Order!*\n\n👤 ${user.first_name}\n💳 ${data.method}\n📌 ${data.proof}`, { parse_mode: 'Markdown' });
    return ctx.reply("⏳ *Payment Request Submitted!* দয়া করে অপেক্ষা করুন...", { parse_mode: 'Markdown' });
});

async function showPendingOrdersMenu(ctx) {
    let buttons = [];
    Object.keys(pendingOrders).forEach((id) => { buttons.push([Markup.button.callback(`📦 ${pendingOrders[id].name}`, `view_order_${id}`)]); });
    return buttons.length === 0 ? ctx.reply("⭐ No pending orders.") : ctx.reply("⭐ *Select Order:*", { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
}

// নতুন আপডেট করা view_order ফাংশন এখানে যুক্ত করা হলো
bot.action(/^view_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];
    const ord = pendingOrders[targetUserId];
    if (!ord) return ctx.reply("❌ অর্ডারটি পাওয়া যায়নি।");

    const waMessage = encodeURIComponent(`🚨 *নতুন অর্ডার এসেছে!*\n👤 নাম: ${ord.name}\n🆔 আইডি: ${ord.userId}\n💳 পেমেন্ট: ${ord.method}\n📌 প্রুফ: ${ord.proof}`);
    const waLink = `https://wa.me/8801864339154?text=${waMessage}`;

    return ctx.reply(`📋 *Order:* ${ord.name}\n👤 @${ord.username}\n💳 ${ord.method}\n📌 ${ord.proof}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirm Order', `start_custom_pass_${targetUserId}`)],
            [Markup.button.url('💬 WhatsApp এ মেসেজ পাঠান', waLink)],
            [Markup.button.callback('❌ Cancel', `cancel_order_${targetUserId}`)]
        ])
    });
});

bot.action(/^start_custom_pass_(.+)$/, async (ctx) => { if (!isAdmin(ctx)) return; await ctx.answerCbQuery(); adminSession[ctx.from.id.toString()] = { step: 'waiting_for_email', targetUserId: ctx.match[1] }; return ctx.reply("📧 Email টি লিখে পাঠান:"); });
bot.action(/^cancel_order_(.+)$/, async (ctx) => { if (!isAdmin(ctx)) return; delete pendingOrders[ctx.match[1]]; return ctx.reply("❌ Cancelled."); });

async function showTotalUsersStats(ctx) { return ctx.reply(`🚀 মোট ইউজার: ${allStartedUsers.size}`); }
bot.action('login_done', async (ctx) => { await ctx.answerCbQuery(); return ctx.reply("❤️ ধন্যবাদ!"); });

module.exports = async (req, res) => {
    if (req.method === 'POST') { try { await bot.handleUpdate(req.body); res.status(200).json({ status: 'ok' }); } catch (e) { res.status(500).json({ error: 'Error' }); } }
    else { res.status(200).json({ message: 'Bot is running!' }); }
};
