const { Telegraf, Markup } = require('telegraf');

// আপনার দেওয়া টোকেন
const bot = new Telegraf('8810183896:AAEtcbK-z19BkACmoUBTJiTYzvxCUVLHKzc');

// অ্যাডমিনের টেলিগ্রাম আইডি
const ADMIN_ID = '1262396547';

// /start কমান্ড বা মূল মেনু (এখানে শুরুতে 'Login Account' বাটনটি হাইড বা অনুপস্থিত থাকবে)
bot.start((ctx) => {
    const userName = ctx.from.first_name || "User";
    return ctx.reply(
        `⭐ *AdsPower Seller BD*\n\n` +
        `🚀 *স্বাগতম ${userName}! আপনি আমাদের লাকি কাস্টমার!* \n\n` +
        "Unlock Ultimate Multi-Accounting Security & Speed!\n" +
        "নিচের বাটনগুলো থেকে আপনার প্রয়োজনীয় অপশনটি সিলেক্ট করুন:",
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

// AdsPower Details বাটনে ক্লিক করলে
bot.action('details', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "🚀 *AdsPower Antidetect Browser - 10 Days Premium Pass*\n\n" +
        "Unlock Ultimate Multi-Accounting Security & Speed!\n" +
        "আপনি কি Facebook, TikTok, E-commerce, Affiliate Marketing বা Cpa Marketing-এর জন্য একাধিক অ্যাকাউন্ট ম্যানেজ করতে গিয়ে ব্যান বা রেস্ট্রিকশনের সমস্যায় পড়ছেন?\n\n" +
        "আজই নিন AdsPower 10-Days Premium Access এবং আপনার অনলাইন বিজনেসকে নিয়ে যান অন্য লেভেলে!\n\n" +
        "🌟 *10-Din-er Trial / Package-e Ja Ja Benefits Pacchen*\n\n" +
        "🔒 *Advanced Fingerprint Protection:* প্রতিটি ব্রাউজার প্রোফাইলের জন্য আলাদা Real Canvas, WebGL, Audio, and Hardware Fingerprint—যাতে ফেসবুক বা অন্য প্ল্যাটফর্ম কখনোই ট্র্যাক করতে না পারে।\n\n" +
        "🌐 *Unlimited Proxy Integration:* HTTP, HTTPS, SOCKS5, SSH প্রক্সি খুব সহজেই সেটআপ করার সুবিধা। আইপি লিক হওয়ার কোনো ঝুঁকি নেই।\n\n" +
        "👥 *Team Collaboration & Permission Control:* আপনার টিম মেম্বারদের নির্দিষ্ট প্রোফাইলের অ্যাক্সেস দিতে পারবেন পাসওয়ার্ড শেয়ার না করেই।\n\n" +
        "🤖 *RPA Automation / Synchronization:* একটি ব্রাউজারে কাজ করলেই বাকি ব্রাউজারগুলোতে অটোমেটিক একই কাজ হয়ে যাবে (Multi-window sync)। পুনরাবৃত্তি কাজগুলোর জন্য রয়েছে ফ্রি অটোমেশন ফিচার।\n\n" +
        "⚡️ *Lightning-Fast Speed & Stability:* কোনো ল্যাগ ছাড়াই স্মুথ ব্রাউজিং এবং হাই-পারফরম্যান্স কুকি কুশন ম্যানেজমেন্ট।\n\n" +
        "🎁 *Extra What You Can Offer (স্পেশাল অফার ও সার্ভিস)*\n\n" +
        "🛠 *Instant Setup Guide / Support:* অ্যাকাউন্ট লগইন করা থেকে শুরু করে প্রক্সি সেটআপ করার ফুল ফ্রি গাইডলাইন।\n" +
        "🛡 *Replacement / Uptime Guarantee:* ১ দিনের মধ্যে কোনো মেজর টেকনিক্যাল ইস্যু হলে ইনস্ট্যান্ট সাপোর্ট বা অ্যাকাউন্ট রিপ্লেসমেন্ট গ্যারান্টি।\n\n" +
        "⏳ *Duration:* 10 Days Full Access\n\n" +
        "💳 *Price:* 30 TK\n" +
        "   *USDT:* 0.24",
        { parse_mode: 'Markdown' }
    );
});

// 🛒 Buy Now মেনু
bot.action('buy_options', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n✨ *You are the lucky customer!*\n\n💳 *Select Payment Method*\nদয়া করে আপনার পছন্দের পেমেন্ট মেথডটি সিলেক্ট করুন (মূল্য: ৩০ টাকা / 0.24 USDT):",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🇧🇩 bKash', 'pay_bkash'), Markup.button.callback('🇧🇩 Nagad', 'pay_nagad')],
                [Markup.button.callback('🌐 Binance (USDT)', 'pay_binance'), Markup.button.callback('🌐 Payoneer', 'pay_payoneer')]
            ])
        }
    );
});

// 👤 My Profile
bot.action('profile', async (ctx) => {
    await ctx.answerCbQuery();
    const user = ctx.from;
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n" +
        "💎 *You are the lucky customer!* 🍀\n\n" +
        `👤 *My Profile Info*\n\n` +
        `• Name: ${user.first_name} ${user.last_name || ''}\n` +
        `• Username: @${user.username || 'N/A'}\n` +
        `• User ID: \`${user.id}\`\n` +
        `• Customer ID: \`98652609\`\n` +
        `• Email: \`mithuchandra647@gmail.com\``,
        { parse_mode: 'Markdown' }
    );
});

// 🛍 My Order
bot.action('my_order', async (ctx) => {
    await ctx.answerCbQuery();
    const now = new Date();
    
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n" +
        "🛍 *My Order History*\n\n" +
        "📦 *Ordered Package:* AdsPower 10 Days Full Access\n" +
        "💵 *Price:* 30 TK / 0.24 USDT\n" +
        `📅 *Date & Time:* ${now.toLocaleDateString()}, ${now.toLocaleTimeString()}\n` +
        "📌 *Status:* ⏳ Pending / Complete payment to unlock\n\n" +
        "পেমেন্ট সম্পন্ন না করা পর্যন্ত লগইন প্যানেল হাইড থাকবে। পেমেন্ট করার পর এটি আনলক হবে।",
        { parse_mode: 'Markdown' }
    );
});

// 🧾 Transaction
bot.action('transaction', async (ctx) => {
    await ctx.answerCbQuery();
    const now = new Date();

    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n" +
        "🧾 *Transaction Records*\n\n" +
        "• *Service:* AdsPower 10 Days Full Access\n" +
        "• *Amount:* 30 TK (0.24 USDT)\n" +
        `• *Date & Time:* ${now.toLocaleDateString()}, ${now.toLocaleTimeString()}\n` +
        "• *Status:* Awaiting Confirmation",
        { parse_mode: 'Markdown' }
    );
});

// 📞 Contact Support
bot.action('support', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n\n" +
        "🔥 *Hey Premium Affiliate Marketer বা CPA Marketer!*\n" +
        "আপনার যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি যোগাযোগ করুন। আমরা ২৪/৭ সার্ভিস প্রদানে প্রস্তুত।\n\n" +
        "👑 *Admin Contact:* @prime8088",
        { parse_mode: 'Markdown' }
    );
});

// ================= Payment Flows =================
bot.action('pay_bkash', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n💳 **bKash Payment Details:**\nটাকা পাঠানোর জন্য নিচের বাটনগুলো ফলো করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('1. Admin Prime!', 'dummy_prime')],
                [Markup.button.callback('2. TrxID code chaibe', 'dummy_trx')],
                [Markup.button.callback('3. 01864339154 (Send Money)', 'dummy_number')],
                [Markup.button.callback('4. Confirm Payment', 'confirm_payment')]
            ])
        }
    );
});

bot.action('pay_nagad', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n💳 **Nagad Payment Details:**\nটাকা পাঠানোর জন্য নিচের বাটনগুলো ফলো করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('1. Admin Prime!', 'dummy_prime')],
                [Markup.button.callback('2. TrxID code chaibe', 'dummy_trx')],
                [Markup.button.callback('3. 01864339154 (Send Money)', 'dummy_number')],
                [Markup.button.callback('4. Confirm Payment', 'confirm_payment')]
            ])
        }
    );
});

bot.action('pay_binance', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n🌐 **Binance Payment Details:**\nটাকা পাঠানোর জন্য নিচের বাটনগুলো ফলো করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('1. Admin Prime!', 'dummy_prime')],
                [Markup.button.callback('2. TxID/Screenshot দিন', 'dummy_trx')],
                [Markup.button.callback('3. Pay ID: 955102483 / TRC20', 'dummy_number')],
                [Markup.button.callback('4. Confirm Payment', 'confirm_payment')]
            ])
        }
    );
});

bot.action('pay_payoneer', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "⭐ *AdsPower Seller BD*\n🌐 **Payoneer Payment Details:**\nটাকা পাঠানোর জন্য নিচের বাটনগুলো ফলো করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('1. Admin Prime!', 'dummy_prime')],
                [Markup.button.callback('2. Details দিন', 'dummy_trx')],
                [Markup.button.callback('3. Email: mithuchandra647@gmail.com', 'dummy_number')],
                [Markup.button.callback('4. Confirm Payment', 'confirm_payment')]
            ])
        }
    );
});

// পেমেন্ট কনফার্ম হলে অ্যাডমিনের কাছে অর্ডার ডিটেইলস যাবে এবং ইউজারের জন্য '🔐 Login Account' বাটন আনলক হবে
bot.action('confirm_payment', async (ctx) => {
    await ctx.answerCbQuery("Payment request sent to admin!");
    const user = ctx.from;
    
    // অ্যাডমিন প্যানেল নোটিফিকেশন (User ID, Username এবং Ordered Name সহ)
    try {
        await ctx.telegram.sendMessage(
            ADMIN_ID,
            `🚨 *New Order Confirmed & Paid!*\n\n` +
            `📦 *Ordered Item:* AdsPower 10 Days Full Access\n` +
            `👤 *User Name:* ${user.first_name}\n` +
            `🔗 *Username:* @${user.username || 'N/A'}\n` +
            `🆔 *User ID:* \`${user.id}\``
        );
    } catch (err) {
        console.error("Admin notification error:", err);
    }

    // ইউজারকে সাকসেস মেসেজ এবং আনলকড লগইন বাটন প্রদান
    return ctx.reply(
        "🎉 *Congratulations for your purchase!* ❤️\n\n" +
        "আপনার পেমেন্ট সফলভাবে ভেরিফাই ও কনফার্ম হয়েছে।\n" +
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

// ================= Login Panel & Get Code System =================
bot.action('login_panel', async (ctx) => {
    await ctx.answerCbQuery();
    
    return ctx.reply(
        "🔐 *AdsPower Secure Login Panel*\n\n" +
        "⚡ *Status:* Unlocked\n\n" +
        "📧 *Mail:* `mithuchandra647@gmail.com`\n" +
        "🔑 *Password:* `Pass_BD_98652609`\n\n" +
        "📥 *Login Code:* [ ⏳ Waiting for code... ]\n\n" +
        "কোড পেতে নিচের **🔑 Get Login Code** বাটনে ক্লিক করুন:",
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🔑 Get Login Code', 'get_login_code')],
                [Markup.button.callback('✅ Done ❤️', 'login_done')]
            ])
        }
    );
});

// গেট কোড বাটনে ক্লিক করলে অ্যাডমিনের ইনবক্সে রিকোয়েস্ট যাবে
bot.action('get_login_code', async (ctx) => {
    await ctx.answerCbQuery("Login code request sent to Admin!");
    const user = ctx.from;

    try {
        await ctx.telegram.sendMessage(
            ADMIN_ID,
            `🔑 *Login Code Request!*\n\n` +
            `👤 *User:* ${user.first_name} (@${user.username || 'N/A'})\n` +
            `🆔 *User ID:* \`${user.id}\`\n\n` +
            `⚠️ *Login code please...*`
        );
    } catch (err) {
        console.error("Get code request error:", err);
    }

    return ctx.reply(
        "📤 *Login Code Request Sent!*\n\nঅ্যাডমিনের কাছে কোডের অনুরোধ পাঠানো হয়েছে। অ্যাডমিন কোড প্রদান করলে তা সংগ্রহ করে **✅ Done ❤️** এ ক্লিক করুন।"
    );
});

// Done বাটনে ক্লিক করলে ফাইনাল কনগ্রাচুলেশনস মেসেজ
bot.action('login_done', async (ctx) => {
    await ctx.answerCbQuery();
    return ctx.reply(
        "❤️ *Congratulations for your purchase & believe!* 🚀\n\n" +
        "আপনার অর্ডার এবং এক্সেস সফলভাবে সম্পন্ন হয়েছে। আপনার AdsPower প্রিমিয়াম পাস উপভোগ করুন!\n\n" +
        "যেকোনো প্রয়োজনে যোগাযোগ করুন: @prime8088",
        { parse_mode: 'Markdown' }
    );
});

// ডামি বাটন হ্যান্ডলার
bot.action(['dummy_prime', 'dummy_trx', 'dummy_number'], async (ctx) => {
    await ctx.answerCbQuery("এটি তথ্যমূলক বাটন। পেমেন্ট শেষে 'Confirm Payment' এ ক্লিক করুন।", { show_alert: true });
});

// Vercel Serverless Function এক্সপোর্ট
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body);
            res.status(200).json({ status: 'ok' });
        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'Error handling update' });
        }
    } else {
        res.status(200).json({ message: 'AdsPower Telegram Bot is running!' });
    }
};