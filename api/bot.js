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

// /start কমান্ড
bot.start((ctx) => {
    const userId = ctx.from.id.toString();
    allStartedUsers.add(userId);

    const userName = ctx.from.first_name || "User";
    return ctx.reply(
        `⭐ *AdsPower Seller BD*\n\n` +
        `🚀 *স্বাগতম ${userName}! আপনি আমাদের লাকি কাস্টমার!* \n\n` +
        "Unlock Ultimate Multi-Accounting Security & Speed!\n" +
        "নিচের বাটনগুলো থেকে আপনার প্রয়োজনীয় অপশনটি সিলেক্ট করুন:",
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
    return ctx.reply("🚀 *AdsPower Antidetect Browser - 10 Days Premium Pass*\n\nDuration: 10 Days Full Access\n💳 Price: 30 TK / 0.24 USDT", { parse_mode: 'Markdown' });
});

bot.action('buy_options', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("⭐ *AdsPower Seller BD*\n✨ *Select Payment Method*\nপেমেন্ট মেথড সিলেক্ট করুন:", {
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

    if (!history || history.length === 0) {
        return ctx.reply("🛍 *My Orders:* আপনার কোনো পূর্ববর্তী অর্ডার নেই।", { parse_mode: 'Markdown' });
    }

    let text = "🛍 *Your Order History:*\n\n";
    history.forEach((ord, index) => {
        text += `${index + 1}. *Package:* ${ord.packageName}\n   *Method:* ${ord.method}\n   *Status:* ${ord.status}\n   *Date:* ${ord.date}\n\n`;
    });

    return ctx.reply(text, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('🗑 Clear History', 'clear_my_order')]
        ])
    });
});

bot.action('clear_my_order', async (ctx) => {
    await ctx.answerCbQuery("Order history cleared!");
    userOrderHistory[ctx.from.id] = [];
    return ctx.reply("🗑 আপনার অর্ডার হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে।");
});

bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🧾 *Transaction Records:* Verified", { parse_mode: 'Markdown' });
});

bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("👑 *Admin Contact:* @prime8088", { parse_mode: 'Markdown' });
});

// Payment Flows
bot.action('pay_bkash', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'bKash' };
    return ctx.reply("💳 **bKash Payment Details:**\n📞 Send Money: `01864339154`\n\nনিচের বাটনে ক্লিক করে TrxID দিন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✍️ TrxID দিন', 'input_trx')]])
    });
});

bot.action('pay_nagad', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Nagad' };
    return ctx.reply("💳 **Nagad Payment Details:**\n📞 Send Money: `01864339154`\n\nনিচের বাটনে ক্লিক করে TrxID দিন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✍️ TrxID দিন', 'input_trx')]])
    });
});

bot.action('pay_binance', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Binance' };
    return ctx.reply("🌐 **Binance Payment Details:**\n📌 Pay ID: `955102483`\n\nস্ক্রিনশট বা TxID দিন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('📤 স্ক্রিনশট বা TxID দিন', 'input_screenshot')]])
    });
});

bot.action('pay_payoneer', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Payoneer' };
    return ctx.reply("🌐 **Payoneer Details:**\n📧 Email: `mithuchandra647@gmail.com`\n\nDetails দিন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('✍️ Details দিন', 'input_payoneer_details')]])
    });
});

bot.action('input_trx', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id].waitingFor = 'trx';
    return ctx.reply("আপনার পেমেন্টের TrxID কোডটি লিখে পাঠান:");
});

bot.action('input_screenshot', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id].waitingFor = 'screenshot';
    return ctx.reply("আপনার বাইন্যান্স পেমেন্টের স্ক্রিনশট বা TxID ছবি আকারে পাঠান:");
});

bot.action('input_payoneer_details', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id].waitingFor = 'payoneer_details';
    return ctx.reply("আপনার Payoneer Email এবং Customer ID লিখে পাঠান:");
});

// Text / Input Handler
bot.on(['text', 'photo'], async (ctx) => {
    const userId = ctx.from.id.toString();
    const text = ctx.message.text;

    if (isAdmin(ctx)) {
        if (text === '/admin' || text === '👑 Close Admin Panel 👑' || text === '⭐ 📦 Pending Orders ⭐' || text === '⭐ 👥 Total Bot Users ⭐') {
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
        }

        if (adminSession[userId] && adminSession[userId].step) {
            const state = adminSession[userId].step;
            const targetUser = adminSession[userId].targetUserId;

            if (state === 'waiting_for_email') {
                adminSession[userId].customEmail = text.trim();
                adminSession[userId].step = 'waiting_for_password';
                return ctx.reply("🔑 এখন এই অ্যাকাউন্টের **Password** টি লিখে পাঠান:");
            } else if (state === 'waiting_for_password') {
                const customPass = text.trim();
                const customEmail = adminSession[userId].customEmail;
                delete adminSession[userId];

                delete pendingOrders[targetUser];

                try {
                    await ctx.telegram.sendMessage(
                        targetUser,
                        "🎉 *Congratulations for your purchase!* ❤️\n\n" +
                        "আপনার পেমেন্ট সফলভাবে ভেরিফাই ও কনফার্ম হয়েছে!\n" +
                        "নিচের বাটনগুলোতে ক্লিক করে আপনার ইমেইল ও পাসওয়ার্ড দেখে বা কপি করে নিন:",
                        {
                            parse_mode: 'Markdown',
                            ...Markup.inlineKeyboard([
                                [Markup.button.callback(`📧 Email: ${customEmail}`, `show_email_${customEmail}`)],
                                [Markup.button.callback(`🔑 Password: ${customPass}`, `show_pass_${customPass}`)],
                                [Markup.button.callback('🔑 Get Login Code', `get_code_${targetUser}`)],
                                [Markup.button.callback('📦 AdsPower Details', 'details')]
                            ])
                        }
                    );
                    return ctx.reply(`✅ Successfully Sent Custom Email & Password to User!`);
                } catch (err) {
                    return ctx.reply(`❌ ইউজারকে মেসেজ পাঠানো যায়নি।`);
                }
            }
        }
    }

    if (!userSession[userId] || !userSession[userId].waitingFor) return;

    const state = userSession[userId].waitingFor;
    if (state === 'trx' || state === 'screenshot' || state === 'payoneer_details') {
        userSession[userId].proof = text || (ctx.message.photo ? "Photo Provided" : "Details Provided");
        userSession[userId].waitingFor = null;

        try { await ctx.deleteMessage(); } catch(e) {}

        return ctx.reply("✅ আপনার পেমেন্ট ইনফো গ্রহণ করা হয়েছে। নিচে কনফার্ম বাটনে ক্লিক করুন:", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✅ Confirm Payment', 'final_confirm')]
            ])
        });
    }
});

// ইমেইল বা পাসওয়ার্ড দেখতে চাইলে অ্যালার্ট বা পপআপে দেখাবে যাতে সহজে কপি করা যায়
bot.action(/^show_email_(.+)$/, async (ctx) => {
    const email = ctx.match[1];
    await ctx.answerCbQuery(`📧 Email: ${email}`, { show_alert: true });
});

bot.action(/^show_pass_(.+)$/, async (ctx) => {
    const password = ctx.match[1];
    await ctx.answerCbQuery(`🔑 Password: ${password}`, { show_alert: true });
});

bot.action('final_confirm', async (ctx) => {
    await ctx.answerCbQuery("Payment Submitted!");
    const user = ctx.from;
    const userId = user.id.toString();
    const data = userSession[userId] || { method: 'Unknown', proof: 'N/A' };

    pendingOrders[userId] = {
        name: user.first_name,
        username: user.username || 'N/A',
        userId: userId,
        method: data.method,
        proof: data.proof
    };

    if (!userOrderHistory[userId]) userOrderHistory[userId] = [];
    userOrderHistory[userId].push({
        packageName: 'AdsPower 10 Days Full Access',
        method: data.method,
        status: 'Pending Verification',
        date: new Date().toLocaleString()
    });

    let proofText = `📦 *Order Name:* AdsPower 10 Days Full Access\n` +
                    `💳 *Payment Method:* ${data.method}\n` +
                    `👤 *User Name:* ${user.first_name}\n` +
                    `🔗 *Username:* @${user.username || 'N/A'}\n` +
                    `🆔 *User ID:* \`${userId}\`\n` +
                    `📌 *Proof:* \`${data.proof}\``;

    try {
        await ctx.telegram.sendMessage(ADMIN_ID, `🚨 *New Order Received!*\n\n` + proofText, { parse_mode: 'Markdown' });
    } catch (err) {}

    return ctx.reply(
        "⏳ *Payment Request Submitted Successfully!* \n\n" +
        "আপনার পেমেন্টটি সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট চেক করছেন...\n" +
        "দয়া করে অপেক্ষা করুন! ❤️",
        { parse_mode: 'Markdown' }
    );
});

// ================= ADMIN MENUS =================

async function showPendingOrdersMenu(ctx) {
    let buttons = [];
    const userIds = Object.keys(pendingOrders);

    if (userIds.length === 0) {
        return ctx.reply("⭐ *Pending Orders:* বর্তমানে কোনো পেন্ডিং অর্ডার নেই।", { parse_mode: 'Markdown' });
    }

    userIds.forEach((id) => {
        const ord = pendingOrders[id];
        buttons.push([Markup.button.callback(`📦 ${ord.name} [ ${ord.method} ]`, `view_order_${id}`)]);
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
    const ord = pendingOrders[targetUserId];

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
            [Markup.button.callback('❌ Cancel Order', `cancel_order_${targetUserId}`)]
        ])
    });
});

bot.action(/^start_custom_pass_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];

    adminSession[ctx.from.id.toString()] = {
        step: 'waiting_for_email',
        targetUserId: targetUserId
    };

    return ctx.reply("📧 অনুগ্রহ করে ইউজারের জন্য নির্ধারিত **Email** টি লিখে পাঠান:");
});

bot.action(/^cancel_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];
    delete pendingOrders[targetUserId];
    return ctx.reply(`❌ Order for ID ${targetUserId} cancelled.`);
});

async function showTotalUsersStats(ctx) {
    const totalCount = allStartedUsers.size;
    let buttons = [];

    Array.from(allStartedUsers).forEach((id, index) => {
        buttons.push([Markup.button.callback(`👤 User #${index + 1} (ID: ${id})`, `inspect_user_${id}`)]);
    });

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

// User clicks Get Login Code
bot.action(/^get_code_(.+)$/, async (ctx) => {
    await ctx.answerCbQuery("Login code request sent to Admin!");
    const user = ctx.from;
    const targetUserId = ctx.match[1];

    try {
        await ctx.telegram.sendMessage(
            ADMIN_ID, 
            `🔑 *Login Code Request from User!*\n\n👤 *User:* ${user.first_name} (\`${targetUserId}\`)\n\nদয়া করে এই ইউজারকে লগইন কোড প্রদান করুন।`
        );
    } catch (err) {}

    return ctx.reply("📤 অ্যাডমিনের কাছে কোডের অনুরোধ পাঠানো হয়েছে। অ্যাডমিন কোড দিলে নিচে 'Done' বাটনে ক্লিক করবেন:", {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Done ❤️', 'login_done')]
        ])
    });
});

bot.action('login_done', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "❤️ *Thank You for Purchasing from AdsPower Seller BD!*\n\n" +
        "আপনার প্রিমিয়াম পাস সফলভাবে অ্যাক্টিভ হয়েছে। আমাদের সেবা নেওয়ার জন্য আপনাকে আন্তরিক ধন্যবাদ! যেকোনো প্রয়োজনে আবার যোগাযোগ করবেন। 🚀",
        { parse_mode: 'Markdown' }
    );
});

// Vercel Handler
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ status: 'ok' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error' });
        }
    } else {
        res.status(200).json({ message: 'Bot is running!' });
    }
};
