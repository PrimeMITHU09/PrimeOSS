const { Telegraf, Markup, Scenes, session } = require('telegraf');

const bot = new Telegraf('8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc');
const ADMIN_ID = '1262396547';
const GROUP_ID = '-5569242233';

// টেম্পোরারি ডেটা স্টোর করার জন্য
const userSession = {};

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
    return ctx.reply("🛍 *Ordered Package:* AdsPower 10 Days Full Access\n💵 *Price:* 30 TK / 0.24 USDT\n📌 *Status:* Pending", { parse_mode: 'Markdown' });
});

// Transaction
bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("🧾 *Transaction Records:* Awaiting Confirmation", { parse_mode: 'Markdown' });
});

// Support
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply("👑 *Admin Contact:* @prime8088", { parse_mode: 'Markdown' });
});

// ================= Payment Flows =================

// bKash Flow
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

// Nagad Flow
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

// Binance Flow
bot.action('pay_binance', async (ctx) => {
    await ctx.answerCbQuery();
    userSession[ctx.from.id] = { method: 'Binance' };
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n" +
        "👤 *Admin Prime!*\n" +
        "🌐 **Binance Payment Details:**\n" +
        "📌 Pay ID: `955102483` / TRC20\n\n" +
        "পেমেন্ট করে স্ক্রিনশট আপলোড করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('📤 TxID/Screenshot আপলোড করুন', 'input_screenshot')],
                [Markup.button.callback('✅ Confirm Payment', 'pre_confirm')]
            ])
        }
    );
});

// Payoneer Flow
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

// Input Handlers via text/photo
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

// Text & Photo message listener for inputs
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

// Pre-Confirm (Are you sure?)
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

// Final Confirm -> Send to Group (-5569242233)
bot.action('final_confirm', async (ctx) => {
    await ctx.answerCbQuery("Payment Confirmed!");
    const user = ctx.from;
    const data = userSession[user.id] || { method: 'Unknown' };

    let proofText = `📦 *Order Name:* AdsPower 10 Days Full Access\n` +
                    `💳 *Payment Method:* ${data.method}\n` +
                    `👤 *User Name:* ${user.first_name}\n` +
                    `🔗 *Username:* @${user.username || 'N/A'}\n` +
                    `🆔 *User ID:* \`${user.id}\`\n` +
                    `📌 *TrxID / Details:* ${data.trxId || data.payoneerDetails || 'N/A'}`;

    try {
        // গ্রুপে পাঠানো (-5569242233)
        if (data.screenshot) {
            await ctx.telegram.sendPhoto(GROUP_ID, data.screenshot, {
                caption: `🚨 *New Verified Premium Order!*\n\n` + proofText,
                parse_mode: 'Markdown'
            });
        } else {
            await ctx.telegram.sendMessage(GROUP_ID, `🚨 *New Verified Premium Order!*\n\n` + proofText, { parse_mode: 'Markdown' });
        }
    } catch (err) {
        console.error("Group sending error:", err);
    }

    // ইউজারকে লগইন প্যানেল বা আনলক মেসেজ দেখানো
    return ctx.reply(
        "🎉 *Congratulations for your purchase!* ❤️\n\n" +
        "আপনার পেমেন্ট সফলভাবে সাবমিট ও কনফার্ম হয়েছে!\n" +
        "নিচের **🔐 Login Account** বাটনে ক্লিক করে আপনার অ্যাকাউন্ট ডিটেইলস দেখে নিন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔐 Login Account', 'login_panel')],
                [Markup.button.callback('📦 AdsPower Details', 'details')]
            ])
        }
    );
});

// Login Panel
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
        await ctx.telegram.sendMessage(ADMIN_ID, `🔑 *Login Code Request!*\n👤 *User:* ${user.first_name} (\`${user.id}\`)`);
    } catch (err) {}
    return ctx.reply("📤 অ্যাডমিনের কাছে কোডের অনুরোধ পাঠানো হয়েছে।");
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
