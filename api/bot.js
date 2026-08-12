const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc');
const ADMIN_ID = '1262396547';
const GROUP_ID = '-5569242233';

const userSession = {};
const pendingOrders = {}; // { userId: { name, username, userId, method, proof } }
const allStartedUsers = new Set(); // বট স্টার্ট করা সব ইউজারের আইডি ট্র্যাক করার জন্য

function isAdmin(ctx) {
    const userId = ctx.from.id.toString();
    return userId === ADMIN_ID;
}

// গোল্ডেন ও প্রিমিয়াম স্টাইলের পার্মানেন্ট রিপ্লাই কিবোর্ড (নিচে শো করবে)
const adminReplyKeyboard = Markup.keyboard([
    ['⭐ 📦 Pending Orders ⭐', '⭐ 👥 Total Bot Users ⭐'],
    ['👑 Close Admin Panel 👑']
]).resize();

// /start কমান্ড
bot.start((ctx) => {
    const userId = ctx.from.id.toString();
    allStartedUsers.add(userId); // কাউন্ট করার জন্য সেভ হলো

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

// AdsPower Details
bot.action('details', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "🚀 *AdsPower Antidetect Browser - 10 Days Premium Pass*\n\n" +
        "Unlock Ultimate Multi-Accounting Security & Speed!\n" +
        "Duration: 10 Days Full Access\n💳 Price: 30 TK / 0.24 USDT",
        { parse_mode: 'Markdown' }
    );
});

// Buy Now মেনু
bot.action('buy_options', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n✨ *You are the lucky customer!*\n\n💳 *Select Payment Method*\nদয়া করে আপনার পছন্দের মেথডটি সিলেক্ট করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🇧🇩 bKash', 'pay_bkash'), Markup.button.callback('🇧🇩 Nagad', 'pay_nagad')],
                [Markup.button.callback('🌐 Binance (USDT)', 'pay_binance'), Markup.button.callback('🌐 Payoneer', 'pay_payoneer')]
            ])
        }
    );
});

bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;
    return ctx.reply(`👤 *My Profile Info*\n\n• Name: ${user.first_name}\n• Username: @${user.username || 'N/A'}\n• User ID: \`${user.id}\``, { parse_mode: 'Markdown' });
});

bot.action('my_order', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🛍 *Ordered Package:* AdsPower 10 Days Full Access\n💵 *Price:* 30 TK / 0.24 USDT\n📌 *Status:* Pending verification", { parse_mode: 'Markdown' });
});

bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🧾 *Transaction Records:* Awaiting Admin Confirmation", { parse_mode: 'Markdown' });
});

bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("👑 *Admin Contact:* @prime8088", { parse_mode: 'Markdown' });
});

// ================= Payment Flows =================
bot.action('pay_bkash', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'bKash' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n👤 *Admin Prime!*\n💳 **bKash Payment Details:**\n📞 Send Money: `01864339154`\n\nটাকা পাঠিয়ে নিচের বাটন থেকে TrxID দিন অথবা সরাসরি কনফার্ম করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ TrxID দিন', 'input_trx')],
                [Markup.button.callback('✅ Confirm Payment', 'pre_confirm')]
            ])
        }
    );
});

bot.action('pay_nagad', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Nagad' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n👤 *Admin Prime!*\n💳 **Nagad Payment Details:**\n📞 Send Money: `01864339154`\n\nটাকা পাঠিয়ে নিচের বাটন থেকে TrxID দিন অথবা সরাসরি কনফার্ম করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ TrxID দিন', 'input_trx')],
                [Markup.button.callback('✅ Confirm Payment', 'pre_confirm')]
            ])
        }
    );
});

bot.action('pay_binance', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Binance' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n👤 *Admin Prime!*\n🌐 **Binance Payment Details:**\n📌 Pay ID: `955102483` / TRC20\n\nপেমেন্ট করে স্ক্রিনশট বা TxID আপলোড করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📤 TxID/Screenshot আপলোড করুন', 'input_screenshot')],
                [Markup.button.callback('✅ Confirm Payment', 'pre_confirm')]
            ])
        }
    );
});

bot.action('pay_payoneer', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Payoneer' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n👤 *Admin Prime!*\n🌐 **Payoneer Payment Details:**\n📧 Email: `mithuchandra647@gmail.com`\n\nনিচের বাটনে ক্লিক করে আপনার ইমেইল এবং কাস্টমার আইডি দিন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✍️ Details দিন', 'input_payoneer_details')],
                [Markup.button.callback('✅ Confirm Payment', 'pre_confirm')]
            ])
        }
    );
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

bot.on(['text', 'photo'], async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // যদি অ্যাডমিন রিপ্লাই কিবোর্ডের বাটনগুলোতে ক্লিক করেন
    if (isAdmin(ctx)) {
        if (text === '⭐ 📦 Pending Orders ⭐') {
            return showPendingOrdersMenu(ctx);
        } else if (text === '⭐ 👥 Total Bot Users ⭐') {
            return showTotalUsersStats(ctx);
        } else if (text === '👑 Close Admin Panel 👑') {
            return ctx.reply("👑 Admin Panel Closed.", Markup.removeKeyboard());
        }
    }

    if (!userSession[userId] || !userSession[userId].waitingFor) return;

    const state = userSession[userId].waitingFor;
    if (state === 'trx') {
        userSession[userId].trxId = text;
        userSession[userId].waitingFor = null;
        return ctx.reply(`✅ TrxID সংগৃহীত হয়েছে: \`${userSession[userId].trxId}\`\nএখন নিচের কনফার্ম বাটনে ক্লিক করুন।`, { parse_mode: 'Markdown' });
    }
    if (state === 'screenshot') {
        userSession[userId].screenshot = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1].file_id : text;
        userSession[userId].waitingFor = null;
        return ctx.reply("✅ স্ক্রিনশট সংরক্ষিত হয়েছে! এখন Confirm Payment এ ক্লিক করুন।");
    }
    if (state === 'payoneer_details') {
        userSession[userId].payoneerDetails = text;
        userSession[userId].waitingFor = null;
        return ctx.reply(`✅ Details সংরক্ষিত হয়েছে: ${userSession[userId].payoneerDetails}\nএখন Confirm Payment এ ক্লিক করুন।`);
    }
});

bot.action('pre_confirm', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("⚠️ আপনি কি নিশ্চিত যে আপনি পেমেন্ট সম্পন্ন করেছেন?", {
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✔️ Yes', 'final_confirm'), Markup.button.callback('❌ No', 'cancel_confirm')]
        ])
    });
});

bot.action('cancel_confirm', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("পেমেন্ট কনফার্মেশন বাতিল করা হয়েছে।");
});

bot.action('final_confirm', async (ctx) => {
    await ctx.answerCbQuery("Payment Submitted!");
    const user = ctx.from;
    const data = userSession[user.id] || { method: 'Unknown' };

    pendingOrders[user.id] = {
        name: user.first_name,
        username: user.username || 'N/A',
        userId: user.id,
        method: data.method,
        proof: data.trxId || data.payoneerDetails || 'TxID/Screenshot Provided',
        screenshot: data.screenshot || null
    };

    let proofText = `📦 *Order Name:* AdsPower 10 Days Full Access\n` +
                    `💳 *Payment Method:* ${data.method}\n` +
                    `👤 *User Name:* ${user.first_name}\n` +
                    `🔗 *Username:* @${user.username || 'N/A'}\n` +
                    `🆔 *User ID:* \`${user.id}\`\n` +
                    `📌 *TrxID / Details:* ${data.trxId || data.payoneerDetails || 'N/A'}`;

    try {
        if (data.screenshot) {
            await ctx.telegram.sendPhoto(GROUP_ID, data.screenshot, { caption: `🚨 *New Pending Payment!*\n\n` + proofText, parse_mode: 'Markdown' });
        } else {
            await ctx.telegram.sendMessage(GROUP_ID, `🚨 *New Pending Payment!*\n\n` + proofText, { parse_mode: 'Markdown' });
        }
        await ctx.telegram.sendMessage(ADMIN_ID, `🚨 *New Order Received!*\n\n` + proofText, { parse_mode: 'Markdown' });
    } catch (err) {}

    return ctx.reply(
        "⏳ *Payment Request Submitted Successfully!* \n\n" +
        "আপনার পেমেন্টটি সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট চেক করছেন...\n" +
        "দয়া করে একটু অপেক্ষা করুন। অ্যাডমিন কনফার্ম করার সাথে সাথেই আপনার কাছে লগইন একাউন্ট ও কোড চলে আসবে! ❤️",
        { parse_mode: 'Markdown' }
    );
});

// ================= ADMIN COMMAND & MENUS =================

// /admin কমান্ড দিলে গোল্ডেন রিপ্লাই কিবোর্ড সহ প্যানেল ওপেন হবে
bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx)) return ctx.reply("❌ আপনার এই কমান্ড ব্যবহারের অনুমতি নেই!");

    return ctx.reply(
        "👑 *Welcome to Admin Golden Control Panel*\n\nনিচের রিপ্লাই কিবোর্ড থেকে অপশন সিলেক্ট করুন:",
        {
            parse_mode: 'Markdown',
            ...adminReplyKeyboard
        }
    );
});

// Pending Orders ফাংশন
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

// নির্দিষ্ট অর্ডারে ক্লিক করলে তার পেমেন্ট ডিটেইলস ও অ্যাপ্রুভ বাটন দেখাবে
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
                     `📌 *Proof/TrxID:* \`${ord.proof}\``;

    return ctx.reply(detailsMsg, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('✅ Confirm & Send Login Details', `approve_order_${targetUserId}`)],
            [Markup.button.callback('❌ Cancel Order', `cancel_order_${targetUserId}`)]
        ])
    });
});

// অ্যাডমিন কনফার্ম করলে ইউজারের কাছে লগইন অ্যাকাউন্ট চলে যাবে
bot.action(/^approve_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];
    delete pendingOrders[targetUserId];

    try {
        await ctx.telegram.sendMessage(
            targetUserId,
            "🎉 *Congratulations for your purchase!* ❤️\n\n" +
            "আপনার পেমেন্ট সফলভাবে ভেরিফাই ও কনফার্ম হয়েছে!\n" +
            "নিচের **🔐 Login Account** বাটনে ক্লিক করে আপনার অ্যাকাউন্ট ডিটেইলস দেখে নিন:",
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🔐 Login Account', 'login_panel')],
                    [Markup.button.callback('📦 AdsPower Details', 'details')]
                ])
            }
        );
        return ctx.reply(`✅ Successfully Approved! User has received the login panel option.`);
    } catch (err) {
        return ctx.reply(`❌ ইউজারকে মেসেজ পাঠানো যায়নি।`);
    }
});

bot.action(/^cancel_order_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];
    delete pendingOrders[targetUserId];
    return ctx.reply(`❌ Order for ID ${targetUserId} cancelled.`);
});

// Total Users Stats ফাংশন
async function showTotalUsersStats(ctx) {
    const totalCount = allStartedUsers.size;
    let buttons = [];

    // ইউজারদের লিস্ট দেখার জন্য বাটন তৈরি
    Array.from(allStartedUsers).forEach((id, index) => {
        buttons.push([Markup.button.callback(`👤 User #${index + 1} (ID: ${id})`, `inspect_user_${id}`)]);
    });

    return ctx.reply(
        `⭐ *Total Bot Users Statistics*\n\n` +
        `🚀 মোট কতজন বট স্টার্ট করেছে: **${totalCount} জন**\n\n` +
        `নিচের তালিকা থেকে যেকোনো ইউজারের ওপর ক্লিক করে দেখতে পারেন:`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons.slice(0, 50)) // সর্বোচ্চ ৫০টি বাটন একসাথে দেখাবে
        }
    );
}

// নির্দিষ্ট ইউজারের আইডি দেখার জন্য
bot.action(/^inspect_user_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) return;
    await ctx.answerCbQuery();
    const id = ctx.match[1];
    return ctx.reply(`👤 *User Details*\n• Telegram User ID: \`${id}\``, { parse_mode: 'Markdown' });
});

// Login Panel for User
bot.action('login_panel', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "🔐 *AdsPower Secure Login Panel*\n\n" +
        "⚡ *Status:* Unlocked\n\n" +
        "📧 *Mail:* `mithuchandra647@gmail.com`\n" +
        "🔑 *Password:* `Pass_BD_98652609`\n\n" +
        "📥 *Login Code:* [ ⏳ Waiting for code... ]",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔑 Get Login Code', 'get_login_code')],
                [Markup.button.callback('✅ Done ❤️', 'login_done')]
            ])
        }
    );
});

bot.action('get_login_code', async (ctx) => {
    await ctx.answerCbQuery("Login code request sent!");
    const user = ctx.from;
    try {
        await ctx.telegram.sendMessage(ADMIN_ID, `🔑 *Login Code Request from User!*\n👤 *User:* ${user.first_name} (\`${user.id}\`)`);
    } catch (err) {}
    return ctx.reply("📤 অ্যাডমিনের কাছে কোডের অনুরোধ পাঠানো হয়েছে। দয়া করে অপেক্ষা করুন।");
});

bot.action('login_done', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("❤️ ধন্যবাদ! আপনার প্রিমিয়াম পাস সফলভাবে অ্যাক্টিভ হয়েছে।");
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
