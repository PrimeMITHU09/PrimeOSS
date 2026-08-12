const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc');
const ADMIN_ID = '1262396547'; // শুধুমাত্র আপনার টেলিগ্রাম আইডি
const GROUP_ID = '-5569242233';

const userSession = {};
const pendingOrders = {};

// সিকিউরিটি চেক ফাংশন
function isAdmin(ctx) {
    const userId = ctx.from.id.toString();
    return userId === ADMIN_ID;
}

// /start কমান্ড
bot.start((ctx) => {
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
        "⭐ *AdsPower Seller BD*\n✨ *You are the lucky customer!*\n\n💳 *Select Payment Method*\nদয়া করে আপনার পছন্দের পেমেন্ট মেথডটি সিলেক্ট করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🇧🇩 bKash', 'pay_bkash'), Markup.button.callback('🇧🇩 Nagad', 'pay_nagad')],
                [Markup.button.callback('🌐 Binance (USDT)', 'pay_binance'), Markup.button.callback('🌐 Payoneer', 'pay_payoneer')]
            ])
        }
    );
});

// My Profile
bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;
    return ctx.reply(
        `👤 *My Profile Info*\n\n• Name: ${user.first_name}\n• Username: @${user.username || 'N/A'}\n• User ID: \`${user.id}\``,
        { parse_mode: 'Markdown' }
    );
});

// My Order
bot.action('my_order', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🛍 *Ordered Package:* AdsPower 10 Days Full Access\n💵 *Price:* 30 TK / 0.24 USDT\n📌 *Status:* Pending verification", { parse_mode: 'Markdown' });
});

// Transaction
bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🧾 *Transaction Records:* Awaiting Admin Confirmation", { parse_mode: 'Markdown' });
});

// Support
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("👑 *Admin Contact:* @prime8088", { parse_mode: 'Markdown' });
});

// ================= Payment Flows =================

bot.action('pay_bkash', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'bKash' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n" +
        "👤 *Admin Prime!*\n" +
        "💳 **bKash Payment Details:**\n" +
        "📞 Send Money: `01864339154`\n\n" +
        "টাকা পাঠিয়ে নিচের বাটন থেকে TrxID দিন অথবা সরাসরি কনফার্ম করুন:",
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
        "⭐ *AdsPower Seller BD*\n" +
        "👤 *Admin Prime!*\n" +
        "💳 **Nagad Payment Details:**\n" +
        "📞 Send Money: `01864339154`\n\n" +
        "টাকা পাঠিয়ে নিচের বাটন থেকে TrxID দিন অথবা সরাসরি কনফার্ম করুন:",
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
        "⭐ *AdsPower Seller BD*\n" +
        "👤 *Admin Prime!*\n" +
        "🌐 **Binance Payment Details:**\n" +
        "📌 Pay ID: `955102483` / TRC20\n\n" +
        "পেমেন্ট করে স্ক্রিনশট বা TxID আপলোড করুন:",
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
        "⭐ *AdsPower Seller BD*\n" +
        "👤 *Admin Prime!*\n" +
        "🌐 **Payoneer Payment Details:**\n" +
        "📧 Email: `mithuchandra647@gmail.com`\n\n" +
        "নিচের বাটনে ক্লিক করে আপনার ইমেইল এবং কাস্টমার আইডি দিন:",
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
    if (!userSession[userId] || !userSession[userId].waitingFor) return;

    const state = userSession[userId].waitingFor;
    
    if (state === 'trx') {
        userSession[userId].trxId = ctx.message.text;
        userSession[userId].waitingFor = null;
        return ctx.reply(`✅ TrxID সংগৃহীত হয়েছে: \`${userSession[userId].trxId}\`\nএখন নিচের কনফার্ম বাটনে ক্লিক করুন।`, { parse_mode: 'Markdown' });
    }
    
    if (state === 'screenshot') {
        userSession[userId].screenshot = ctx.message.photo ? ctx.message.photo[ctx.message.photo.length - 1].file_id : ctx.message.text;
        userSession[userId].waitingFor = null;
        return ctx.reply("✅ স্ক্রিনশট/TxID সংরক্ষিত হয়েছে! এখন Confirm Payment এ ক্লিক করুন।");
    }

    if (state === 'payoneer_details') {
        userSession[userId].payoneerDetails = ctx.message.text;
        userSession[userId].waitingFor = null;
        return ctx.reply(`✅ Details সংরক্ষিত হয়েছে: ${userSession[userId].payoneerDetails}\nএখন Confirm Payment এ ক্লিক করুন।`);
    }
});

bot.action('pre_confirm', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⚠️ আপনি কি নিশ্চিত যে আপনি পেমেন্ট সম্পন্ন করেছেন?",
        {
            ...Markup.inlineKeyboard([
                [Markup.button.callback('✔️ Yes', 'final_confirm'), Markup.button.callback('❌ No', 'cancel_confirm')]
            ])
        }
    );
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
        proof: data.trxId || data.payoneerDetails || 'TxID/Screenshot Provided'
    };

    let proofText = `📦 *Order Name:* AdsPower 10 Days Full Access\n` +
                    `💳 *Payment Method:* ${data.method}\n` +
                    `👤 *User Name:* ${user.first_name}\n` +
                    `🔗 *Username:* @${user.username || 'N/A'}\n` +
                    `🆔 *User ID:* \`${user.id}\`\n` +
                    `📌 *TrxID / Details:* ${data.trxId || data.payoneerDetails || 'N/A'}\n\n` +
                    `🛠 *Admin Approval Command:* \`/approve ${user.id}\``;

    try {
        if (data.screenshot) {
            await ctx.telegram.sendPhoto(GROUP_ID, data.screenshot, {
                caption: `🚨 *New Pending Payment Order!*\n\n` + proofText,
                parse_mode: 'Markdown'
            });
        } else {
            await ctx.telegram.sendMessage(GROUP_ID, `🚨 *New Pending Payment Order!*\n\n` + proofText, { parse_mode: 'Markdown' });
        }

        await ctx.telegram.sendMessage(ADMIN_ID, `🚨 *New Order to Approve!*\n\n` + proofText, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error("Group/Admin notification error:", err);
    }

    return ctx.reply(
        "⏳ *Payment Request Submitted Successfully!* \n\n" +
        "আপনার পেমেন্টটি সফলভাবে জমা হয়েছে। অ্যাডমিন পেমেন্ট চেক করছেন...\n" +
        "দয়া করে একটু অপেক্ষা করুন (Wait a few minutes)। অ্যাডমিন কনফার্ম করার সাথে সাথেই আপনার কাছে লগইন একাউন্ট ও কোড চলে আসবে! ❤️",
        { parse_mode: 'Markdown' }
    );
});

// ================= SECURE ADMIN COMMANDS =================

// /admin কমান্ড (সম্পূর্ণ সিকিউরড)
bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.reply("❌ আপনার এই কমান্ড ব্যবহারের কোনো অনুমতি নেই!");
    }

    let text = "👑 *Admin Control Panel*\n\n📋 *Pending Orders List:*\n";
    let buttons = [];

    const userIds = Object.keys(pendingOrders);
    if (userIds.length === 0) {
        text += "কোনো পেন্ডিং অর্ডার নেই।";
    } else {
        userIds.forEach((id) => {
            const ord = pendingOrders[id];
            text += `• ${ord.name} (ID: \`${id}\`) - ${ord.method}\n`;
            buttons.push([Markup.button.callback(`✅ Approve: ${ord.name}`, `app_${id}`)]);
        });
    }

    return ctx.reply(text, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard(buttons)
    });
});

// /approve কমান্ড (সিকিউরড)
bot.command('approve', async (ctx) => {
    if (!isAdmin(ctx)) return;

    const textParts = ctx.message.text.split(' ');
    const targetUserId = textParts[1];

    if (!targetUserId || !pendingOrders[targetUserId]) {
        return ctx.reply("❌ সঠিক User ID দিন। ব্যবহার: `/approve USER_ID`", { parse_mode: 'Markdown' });
    }

    await sendAccountToUser(ctx, targetUserId);
});

// বাটন ক্লিক অ্যাপ্রুভ (সিকিউরড)
bot.action(/^app_(.+)$/, async (ctx) => {
    if (!isAdmin(ctx)) {
        return ctx.answerCbQuery("❌ আপনার এই একশন নেওয়ার অনুমতি নেই!", { show_alert: true });
    }
    
    await ctx.answerCbQuery();
    const targetUserId = ctx.match[1];
    await sendAccountToUser(ctx, targetUserId);
});

async function sendAccountToUser(ctx, targetUserId) {
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
        return ctx.reply(`✅ Successfully Approved and sent account details to User ID: ${targetUserId}`);
    } catch (err) {
        console.error("Failed to send account:", err);
        return ctx.reply(`❌ ইউজারকে মেসেজ পাঠানো যায়নি।`);
    }
}

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
    await ctx.answerCbQuery("Login code request sent to Admin!");
    const user = ctx.from;
    try {
        await ctx.telegram.sendMessage(ADMIN_ID, `🔑 *Login Code Request from User!*\n👤 *User:* ${user.first_name} (\`${user.id}\`)\n\nদয়া করে ইউজারকে কোড দিন।`);
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
